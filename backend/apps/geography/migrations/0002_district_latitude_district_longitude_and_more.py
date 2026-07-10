from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geography', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='district',
            name='latitude',
            field=models.FloatField(blank=True, help_text='Approximate district location.', null=True),
        ),
        migrations.AddField(
            model_name='district',
            name='longitude',
            field=models.FloatField(blank=True, help_text='Approximate district location.', null=True),
        ),
        migrations.AddField(
            model_name='policestation',
            name='latitude',
            field=models.FloatField(blank=True, help_text='Police station location.', null=True),
        ),
        migrations.AddField(
            model_name='policestation',
            name='longitude',
            field=models.FloatField(blank=True, help_text='Police station location.', null=True),
        ),
    ]
