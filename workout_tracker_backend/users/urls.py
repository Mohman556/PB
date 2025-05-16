from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from .views import UserProfileView, validate_email, google_login, validate_credentials, server_time


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_profile_data(request):
    """
    Special debug endpoint to verify user data is correctly stored in the database.
    """
    User = get_user_model()
    user = User.objects.get(pk=request.user.pk)
    
    # Force a fresh query from the database
    user.refresh_from_db()
    
    # Return the raw data for verification
    return Response({
        'username': user.username,
        'direct_database_values': {
            'height': user.height,
            'weight': user.weight,
            'initial_weight': user.initial_weight,
            'fitness_goal': user.fitness_goal,
            'date_of_birth': user.date_of_birth,
        },
        'field_types': {
            'height': str(type(user.height)),
            'weight': str(type(user.weight)),
            'initial_weight': str(type(user.initial_weight)),
            'fitness_goal': str(type(user.fitness_goal))
        }
    })

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('validate-email/', validate_email, name='validate_email'),
    path('google-login/', google_login, name='google-login'),
    path('validate-credentials/', validate_credentials, name='validate_credentials'),
    path('verify-profile/', verify_profile_data, name='verify-profile'),
    path('api/time/', server_time, name='server-time'),
]