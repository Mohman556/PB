from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import connection
from django.apps import apps

class Command(BaseCommand):
    help = 'Reset database tables while preserving structure'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-superuser',
            action='store_true',
            help='Keep superuser accounts',
        )
        parser.add_argument(
            '--tables',
            nargs='+',
            help='Specific tables to reset (default: all)',
        )

    def handle(self, *args, **options):
        # Get list of tables
        tables = options['tables']
        keep_superuser = options['keep_superuser']
        
        User = get_user_model()
        
        if not tables:
            # Get all app models
            app_models = apps.get_models()
            tables = [model._meta.db_table for model in app_models]
            self.stdout.write(f"Found {len(tables)} tables in the database")
        
        # Check if we're using SQLite (which needs special handling)
        using_sqlite = connection.vendor == 'sqlite'
        
        # For SQLite, we need to temporarily disable foreign key constraints
        cursor = connection.cursor()
        
        try:
            # Disable foreign key checks for SQLite
            if using_sqlite:
                self.stdout.write("Temporarily disabling foreign key constraints for SQLite")
                cursor.execute("PRAGMA foreign_keys = OFF;")
            
            # Handle User table differently if keeping superusers
            if User._meta.db_table in tables and keep_superuser:
                tables.remove(User._meta.db_table)
                self.stdout.write(f"Deleting non-superuser accounts")
                
                # Count before deletion
                total_users = User.objects.count()
                superusers = User.objects.filter(is_superuser=True).count()
                
                # Delete non-superuser accounts
                User.objects.filter(is_superuser=False).delete()
                
                self.stdout.write(f"Deleted {total_users - superusers} non-superuser accounts")
            
            # Determine the order for deletion to respect foreign keys
            # We'll delete in reverse dependency order (usually deleting auth tables last)
            
            # Move auth-related tables to the end to handle dependencies
            auth_related = [t for t in tables if t.startswith('auth_') or t.startswith('users_') or t == User._meta.db_table]
            other_tables = [t for t in tables if t not in auth_related]
            ordered_tables = other_tables + auth_related
            
            # Loop through tables
            for table in ordered_tables:
                self.stdout.write(f"Truncating table {table}")
                
                # Use proper SQL based on database backend
                try:
                    if using_sqlite:
                        cursor.execute(f"DELETE FROM {table}")
                    else:
                        # PostgreSQL, MySQL
                        cursor.execute(f"TRUNCATE TABLE {table} CASCADE")
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Error truncating {table}: {e}"))
            
            self.stdout.write(self.style.SUCCESS('Database reset complete'))
            
            # Check remaining superusers if keeping them
            if keep_superuser:
                superusers = User.objects.filter(is_superuser=True)
                self.stdout.write(f"Kept {superusers.count()} superuser accounts")
                for user in superusers:
                    self.stdout.write(f"  - {user.username} ({user.email})")
                    
        finally:
            # Re-enable foreign key checks for SQLite
            if using_sqlite:
                self.stdout.write("Re-enabling foreign key constraints")
                cursor.execute("PRAGMA foreign_keys = ON;")