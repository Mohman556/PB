from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from .serializers import UserSerializer
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

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

class GoogleLoginView(APIView):
    permission_classes = []  # Public endpoint
    
    def post(self, request):
        credential = request.data.get('credential')
        
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                credential, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            
            # Get user info from the verified token
            email = idinfo['email']
            name = idinfo.get('name', '')
            
            # Check if user exists
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Create a new user
                username = email.split('@')[0]
                # Make sure username is unique
                if User.objects.filter(username=username).exists():
                    username = f"{username}_{User.objects.count()}"
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    # You can set password to None or a random string
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
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# Check if email already exists
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
