from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
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

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """
    Google login API endpoint with clock skew handling
    """
    credential = request.data.get('credential')
    
    if not credential:
        logger.error("No credential provided in request data")
        return Response(
            {'error': 'Google credential is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Log server time for debugging
        server_time = int(time.time())
        logger.info(f"Server timestamp: {server_time}")
        
        # Verify the token with Google with clock skew tolerance
        idinfo = id_token.verify_oauth2_token(
            credential, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=300  # Allow 5 minutes of clock skew
        )
        
        # Get user info from the verified token
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        logger.info(f"Google login successful for email: {email}")
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            logger.info(f"Found existing user: {user.username}")
        except User.DoesNotExist:
            # Create a new user
            username = email.split('@')[0]
            # Make sure username is unique
            if User.objects.filter(username=username).exists():
                username = f"{username}_{User.objects.count()}"
            
            logger.info(f"Creating new user with username: {username}")
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=None
            )
            user.set_unusable_password()  # User can't login with password
            
            # Add additional info if available
            if name:
                user.first_name = name.split(' ')[0] if ' ' in name else name
                user.last_name = name.split(' ')[1] if ' ' in name else ''
            
            user.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Include full user data in response
        from .serializers import UserSerializer
        serializer = UserSerializer(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': serializer.data
        })
        
    except ValueError as e:
        # Log detailed error message
        error_msg = str(e)
        logger.error(f"Invalid Google token: {error_msg}")
        
        # Check for time-related errors and provide better user feedback
        if "Token used too early" in error_msg or "Token used before" in error_msg:
            server_time = int(time.time())
            logger.error(f"Clock synchronization issue. Server time: {server_time}")
            
            return Response({
                'error': 'Authentication failed due to time synchronization issues. Please sync your system clock.',
                'details': error_msg,
                'server_time': server_time
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(
            {'error': f'Invalid token: {error_msg}'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logger.exception(f"Error in Google login: {e}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

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