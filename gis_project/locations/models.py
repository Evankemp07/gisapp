from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    description = models.TextField(blank=True, null=True)
    is_animated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='location_images/', blank=True, null=True)
    is_contestant = models.BooleanField(default=False)

    def __str__(self):
        return self.name



