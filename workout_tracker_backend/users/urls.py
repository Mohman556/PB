from django.urls import path
from .views import UserProfileView, validate_email, GoogleLoginView, validate_credentials

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('validate-email/', validate_email, name='validate_email'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('validate-credentials/', validate_credentials, name='validate_credentials'),
]