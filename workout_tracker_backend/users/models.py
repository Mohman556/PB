from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    fitness_goal = models.CharField(max_length=100, blank=True)
