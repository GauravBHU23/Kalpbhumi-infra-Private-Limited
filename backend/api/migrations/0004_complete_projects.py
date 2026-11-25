from django.db import migrations, models


def update_existing_records(apps, schema_editor):
    database = schema_editor.connection.alias
    Project = apps.get_model("api", "Project")

    Project.objects.using(database).filter(status="ongoing").update(status="completed")


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_company_default_name"),
    ]

    operations = [
        migrations.RunPython(update_existing_records, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="project",
            name="status",
            field=models.CharField(
                choices=[("completed", "Completed"), ("upcoming", "Upcoming")],
                default="completed",
                max_length=20,
            ),
        ),
    ]
