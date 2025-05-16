import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import PermissionDenied
from django_ratelimit.exceptions import Ratelimited

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for REST framework that improves security
    by controlling error information and logging exceptions.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Get the request info for logging
    request = context.get('request')
    client_ip = request.META.get('REMOTE_ADDR', 'unknown') if request else 'unknown'
    user_id = getattr(request.user, 'id', 'anonymous') if request else 'unknown'
    
    # If unexpected error (500), log it but return a generic message
    if response is None:
        logger.error(
            f"Unhandled exception for user {user_id} from IP {client_ip}: {str(exc)}",
            exc_info=True
        )
        
        return Response(
            {'error': 'An unexpected error occurred. Our team has been notified.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Handle rate limiting
    if isinstance(exc, Ratelimited):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        return Response(
            {'error': 'Too many attempts. Please try again later.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Handle 404 errors
    if isinstance(exc, Http404):
        logger.info(f"404 Not Found: {request.path if request else 'unknown'} from IP: {client_ip}")
        return Response(
            {'error': 'The requested resource was not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Handle permission errors
    if isinstance(exc, PermissionDenied):
        logger.warning(f"Permission denied for user {user_id} from IP {client_ip}")
        return Response(
            {'error': 'You do not have permission to perform this action.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # For all other errors, log them with info level
    logger.info(
        f"Exception for user {user_id} from IP {client_ip}: {exc}",
        exc_info=True
    )
    
    return response

# Ratelimit error handler
def ratelimited_error(request, exception):
    """Handler for rate limited requests"""
    logger.warning(f"Rate limit exceeded for IP: {request.META.get('REMOTE_ADDR', 'unknown')}")
    return HttpResponse("Too many requests. Please try again later.", status=429)