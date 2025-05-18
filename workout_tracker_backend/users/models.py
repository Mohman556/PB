from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    fitness_goal = models.FloatField(null=True, blank=True)
    initial_weight = models.FloatField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    fat_percentage = models.FloatField(null=True, blank=True)

    # Method to initialize initial_weight if it's not set
    def save(self, *args, **kwargs):
        # If weight is being set for the first time and initial_weight is not set
        if self.weight and not self.initial_weight:
            self.initial_weight = self.weight
        super().save(*args, **kwargs)

    
