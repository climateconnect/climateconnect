# Generated by Django 2.2.18 on 2021-04-08 05:32

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("climateconnect_api", "0054_faqsection_name_de_translation"),
    ]

    operations = [
        migrations.AddField(
            model_name="faqquestion",
            name="answer_de_translation",
            field=models.TextField(
                blank=True,
                help_text="Deutsch translation of answer column",
                null=True,
                verbose_name="Answer DE translation",
            ),
        ),
        migrations.AddField(
            model_name="faqquestion",
            name="question_de_translation",
            field=models.TextField(
                blank=True,
                help_text="Deutsch translation of question column",
                null=True,
                verbose_name="Question DE translation",
            ),
        ),
    ]
