from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("visits", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="visitrecord",
            name="visit_type",
            field=models.CharField(
                choices=[
                    ("field_home", "Field Visit - Home"),
                    ("office_checkin", "Office Check-in"),
                    ("field_employer", "Field Visit - Employer"),
                    ("other", "Other"),
                ],
                default="field_home",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="historicalvisitrecord",
            name="visit_type",
            field=models.CharField(
                choices=[
                    ("field_home", "Field Visit - Home"),
                    ("office_checkin", "Office Check-in"),
                    ("field_employer", "Field Visit - Employer"),
                    ("other", "Other"),
                ],
                default="field_home",
                max_length=20,
            ),
        ),
    ]
