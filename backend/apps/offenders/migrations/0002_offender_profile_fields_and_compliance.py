import django.db.models.deletion
import simple_history.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("offenders", "0001_initial"),
    ]

    operations = [
        # --- New Offender profile fields ---
        migrations.AddField(
            model_name="offender",
            name="case_number",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Formal case / tracking ID, e.g. 'P-84729-2'. Falls back to the record ID if blank.",
                max_length=30,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="offender",
            name="gps_monitor_enabled",
            field=models.BooleanField(
                default=False,
                help_text="Whether the offender is fitted with an active GPS ankle monitor.",
            ),
        ),
        migrations.AddField(
            model_name="offender",
            name="height",
            field=models.CharField(blank=True, default="", help_text='Free text, e.g. 6\' 1".', max_length=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="offender",
            name="weight",
            field=models.CharField(blank=True, default="", help_text="Free text, e.g. 195 lbs.", max_length=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="offender",
            name="eye_color",
            field=models.CharField(
                blank=True,
                choices=[
                    ("brown", "Brown"),
                    ("blue", "Blue"),
                    ("green", "Green"),
                    ("hazel", "Hazel"),
                    ("gray", "Gray"),
                    ("black", "Black"),
                    ("other", "Other"),
                ],
                default="",
                max_length=10,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="offender",
            name="employer_name",
            field=models.CharField(blank=True, default="", max_length=150),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="offender",
            name="conviction_summary",
            field=models.CharField(
                blank=True,
                default="",
                help_text="e.g. 'Aggravated Assault (Felony Class B)'.",
                max_length=255,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="offender",
            name="sentence_years",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="offender",
            name="years_served",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="offender",
            name="parole_granted_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="offender",
            name="parole_end_date",
            field=models.DateField(blank=True, null=True),
        ),
        # --- Same fields mirrored onto the simple_history snapshot table ---
        migrations.AddField(
            model_name="historicaloffender",
            name="case_number",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Formal case / tracking ID, e.g. 'P-84729-2'. Falls back to the record ID if blank.",
                max_length=30,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="historicaloffender",
            name="gps_monitor_enabled",
            field=models.BooleanField(
                default=False,
                help_text="Whether the offender is fitted with an active GPS ankle monitor.",
            ),
        ),
        migrations.AddField(
            model_name="historicaloffender",
            name="height",
            field=models.CharField(blank=True, default="", help_text='Free text, e.g. 6\' 1".', max_length=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="historicaloffender",
            name="weight",
            field=models.CharField(blank=True, default="", help_text="Free text, e.g. 195 lbs.", max_length=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="historicaloffender",
            name="eye_color",
            field=models.CharField(
                blank=True,
                choices=[
                    ("brown", "Brown"),
                    ("blue", "Blue"),
                    ("green", "Green"),
                    ("hazel", "Hazel"),
                    ("gray", "Gray"),
                    ("black", "Black"),
                    ("other", "Other"),
                ],
                default="",
                max_length=10,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="historicaloffender",
            name="employer_name",
            field=models.CharField(blank=True, default="", max_length=150),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="historicaloffender",
            name="conviction_summary",
            field=models.CharField(
                blank=True,
                default="",
                help_text="e.g. 'Aggravated Assault (Felony Class B)'.",
                max_length=255,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="historicaloffender",
            name="sentence_years",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="historicaloffender",
            name="years_served",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="historicaloffender",
            name="parole_granted_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="historicaloffender",
            name="parole_end_date",
            field=models.DateField(blank=True, null=True),
        ),
        # --- ParoleCondition ---
        migrations.CreateModel(
            name="ParoleCondition",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=120)),
                ("description", models.TextField(blank=True)),
                (
                    "is_violated",
                    models.BooleanField(
                        default=False,
                        help_text="Flags this condition in red, e.g. an active no-contact breach.",
                    ),
                ),
                (
                    "offender",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="parole_conditions",
                        to="offenders.offender",
                    ),
                ),
            ],
            options={
                "ordering": ["created_at"],
            },
        ),
        migrations.CreateModel(
            name="HistoricalParoleCondition",
            fields=[
                ("id", models.BigIntegerField(auto_created=True, blank=True, db_index=True, verbose_name="ID")),
                ("created_at", models.DateTimeField(blank=True, editable=False)),
                ("updated_at", models.DateTimeField(blank=True, editable=False)),
                ("title", models.CharField(max_length=120)),
                ("description", models.TextField(blank=True)),
                (
                    "is_violated",
                    models.BooleanField(
                        default=False,
                        help_text="Flags this condition in red, e.g. an active no-contact breach.",
                    ),
                ),
                ("history_id", models.AutoField(primary_key=True, serialize=False)),
                ("history_date", models.DateTimeField(db_index=True)),
                ("history_change_reason", models.CharField(max_length=100, null=True)),
                (
                    "history_type",
                    models.CharField(choices=[("+", "Created"), ("~", "Changed"), ("-", "Deleted")], max_length=1),
                ),
                (
                    "history_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "offender",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to="offenders.offender",
                    ),
                ),
            ],
            options={
                "verbose_name": "historical parole condition",
                "verbose_name_plural": "historical parole conditions",
                "ordering": ("-history_date", "-history_id"),
                "get_latest_by": ("history_date", "history_id"),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        # --- ParoleIncident ---
        migrations.CreateModel(
            name="ParoleIncident",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "incident_type",
                    models.CharField(
                        choices=[
                            ("missed_checkin", "Missed Check-in"),
                            ("contraband", "Contraband"),
                            ("curfew_violation", "Curfew Violation"),
                            ("other", "Other"),
                        ],
                        default="other",
                        max_length=30,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[("pending", "Pending"), ("resolved", "Resolved"), ("infraction", "Infraction")],
                        default="pending",
                        max_length=15,
                    ),
                ),
                ("date", models.DateField()),
                ("description", models.TextField(blank=True)),
                (
                    "added_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "offender",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name="incidents", to="offenders.offender"
                    ),
                ),
            ],
            options={
                "ordering": ["-date", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="HistoricalParoleIncident",
            fields=[
                ("id", models.BigIntegerField(auto_created=True, blank=True, db_index=True, verbose_name="ID")),
                ("created_at", models.DateTimeField(blank=True, editable=False)),
                ("updated_at", models.DateTimeField(blank=True, editable=False)),
                (
                    "incident_type",
                    models.CharField(
                        choices=[
                            ("missed_checkin", "Missed Check-in"),
                            ("contraband", "Contraband"),
                            ("curfew_violation", "Curfew Violation"),
                            ("other", "Other"),
                        ],
                        default="other",
                        max_length=30,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[("pending", "Pending"), ("resolved", "Resolved"), ("infraction", "Infraction")],
                        default="pending",
                        max_length=15,
                    ),
                ),
                ("date", models.DateField()),
                ("description", models.TextField(blank=True)),
                ("history_id", models.AutoField(primary_key=True, serialize=False)),
                ("history_date", models.DateTimeField(db_index=True)),
                ("history_change_reason", models.CharField(max_length=100, null=True)),
                (
                    "history_type",
                    models.CharField(choices=[("+", "Created"), ("~", "Changed"), ("-", "Deleted")], max_length=1),
                ),
                (
                    "added_by",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "history_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "offender",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to="offenders.offender",
                    ),
                ),
            ],
            options={
                "verbose_name": "historical parole incident",
                "verbose_name_plural": "historical parole incidents",
                "ordering": ("-history_date", "-history_id"),
                "get_latest_by": ("history_date", "history_id"),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
    ]
