from django.db import migrations

def do_nothing(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0003_user_initial_weight'),
    ]

    operations = [
        migrations.RunPython(do_nothing),
    ]