# Generated by Django 5.0.6 on 2024-06-17 07:45

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0002_alter_eventgroup_end_value_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='eventgroup',
            name='research_question',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='event_groups', to='service.researchquestion'),
        ),
    ]
