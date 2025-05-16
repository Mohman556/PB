from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Reset all user profile data without deleting accounts'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            help='Reset profile for specific username only',
        )

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        
        if username:
            # Reset profile for specific user
            try:
                user = User.objects.get(username=username)
                self._reset_user_profile(user)
                self.stdout.write(self.style.SUCCESS(f'Reset profile data for user: {username}'))
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User not found: {username}'))
        else:
            # Reset profiles for all users
            users = User.objects.all()
            count = users.count()
            
            for user in users:
                self._reset_user_profile(user)
            
            self.stdout.write(self.style.SUCCESS(f'Reset profile data for {count} users'))
    
    def _reset_user_profile(self, user):
        """Reset profile fields for a user"""
        # Reset profile fields - adjust these based on your User model
        user.height = None
        user.weight = None
        user.fitness_goal = None
        user.initial_weight = None
        
        # Save the changes
        user.save()