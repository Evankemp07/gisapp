# Generated by Django 5.1.7 on 2025-03-21 15:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0002_location_is_animated'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='location_images/'),
        ),
    ]
