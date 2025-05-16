from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import BaseAuthentication
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_protect
# from django_ratelimit.decorators import ratelimit
from google.oauth2 import id_token
from google.auth.transport import requests
from .serializers import UserSerializer
import logging
import time

# Get logger
logger = logging.getLogger(__name__)

# Get User model
User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def validate_credentials(request):
    username = request.data.get('username')
    email = request.data.get('email')
    
    errors = {}
    
    # Check if username already exists
    if username and User.objects.filter(username=username).exists():
        errors['username'] = 'This username is already taken'
    
    # Check if email already exists
    if email and User.objects.filter(email=email).exists():
        errors['email'] = 'This email is already registered'
    
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({'valid': True})

@api_view(['GET'])
def server_time(request):
    """
    Return the current server time as a Unix timestamp
    """
    return Response({
        'timestamp': int(time.time()),
        'human_readable': time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())
    })

# @ratelimit(key='ip', rate='25/h', method='POST', block=True)
@csrf_protect
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def google_login(request):
    """
    Google login API endpoint
    """
    client_ip = request.META.get('REMOTE_ADDR', 'unknown')
    logger.info(f"Google login attempt from IP: {client_ip}")


    credential = request.data.get('credential')
    
    if not credential:
        logger.warning(f"Missing credential in request from IP: {client_ip}")
        return Response(
            {'error': 'Google credential is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Record server time for debugging clock skew issues
        server_time = int(time.time())
        
        # Verify token with Google with generous clock skew tolerance
        try:
            idinfo = id_token.verify_oauth2_token(
                credential, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=600  # Allow 10 minutes of clock skew
            )
            logger.info(f"Google token validated successfully for email: {idinfo.get('email', 'unknown')}")
        except ValueError as ve:
            error_msg = str(ve)
            logger.warning(f"Google token validation failed from IP {client_ip}: {error_msg}")
            
            # Special handling for common errors
            if "Token used too early" in error_msg or "Token used before issued" in error_msg:
                return Response({
                    'error': 'Authentication failed due to time synchronization issues.',
                    'details': error_msg,
                    'server_time': server_time
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({
                'error': 'Google authentication failed',
                'details': error_msg
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Extract user info from verified token
        email = idinfo.get('email')
        if not email:
            logger.warning(f"No email found in token from IP: {client_ip}")
            return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
            
        name = idinfo.get('name', '')
        
        # Look up or create user
        try:
            user = User.objects.get(email=email)
            logger.info(f"Existing user found: {user.username}")
        except User.DoesNotExist:
            # Create a new user
            username = email.split('@')[0]
            
            # Ensure username is unique
            base_username = username
            count = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{count}"
                count += 1
            
            logger.info(f"Creating new user with username: {username} for email: {email}")
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=None
            )
            user.set_unusable_password()
            
            # Add name information if available
            if name:
                parts = name.split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''
            
            user.save()
        
        # Generate JWT tokens for authentication
        refresh = RefreshToken.for_user(user)
        
        # Get serialized user data
        from .serializers import UserSerializer
        serializer = UserSerializer(user)
        
        # Record successful login
        logger.info(f"Google login successful for user: {user.username} from IP: {client_ip}")
        
        # Return success response with tokens and user data
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': serializer.data
        })
            
    except Exception as e:
        logger.exception(f"Unexpected error in Google login from IP {client_ip}: {str(e)}")
        return Response(
            {'error': 'Login failed due to an internal error. Please try again later.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def validate_email(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        email_exists = User.objects.filter(email=email).exists()
    except Exception as e:
        return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'email': email,
        'exists': email_exists
    })



class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)