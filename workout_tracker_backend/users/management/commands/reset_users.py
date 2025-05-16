from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import connection
from django.apps import apps

class Command(BaseCommand):
    help = 'Reset user accounts and profile data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-superuser',
            action='store_true',
            help='Keep superuser accounts',
        )

    def handle(self, *args, **options):
        User = get_user_model()
        keep_superuser = options['keep_superuser']
        
        # Count users before
        total_before = User.objects.count()
        
        if keep_superuser:
            # Get list of superusers to keep
            superusers = User.objects.filter(is_superuser=True)
            superuser_count = superusers.count()
            
            # Delete non-superusers
            deleted = User.objects.filter(is_superuser=False).delete()
            
            self.stdout.write(self.style.SUCCESS(f'Kept {superuser_count} superuser accounts'))
            self.stdout.write(self.style.SUCCESS(f'Deleted {total_before - superuser_count} non-superuser accounts'))
            
            # List remaining superusers
            for user in superusers:
                self.stdout.write(f"  - {user.username} ({user.email})")
        else:
            # Delete all users
            deleted = User.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted all {total_before} user accounts'))
            self.stdout.write(self.style.WARNING('No users remain in the database, including superusers'))
            self.stdout.write('You may want to create a new superuser with:')
            self.stdout.write('  python manage.py createsuperuser')