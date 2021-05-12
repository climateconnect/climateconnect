from typing import Any
from django.core.management.base import BaseCommand


from climateconnect_api.models import UserProfile, Language
from organization.models import Organization, Project

class Command(BaseCommand):
    help = "Migrate tables to multilanguage system"

    def handle(self, *args: Any, **options: Any) -> None:
        create_language_test_data()
        english_language = Language.objects.filter(language_code='en')[0]
        tables = [UserProfile, Organization, Project]
        for table in tables:
            migrate_table(table, english_language)

        print("added languages to all profiles, projects and orgs!")

def migrate_table(table, english_language):
    entries_without_language = table.objects.filter(language__isnull=True)
    print("{} without language!".format(entries_without_language.count()))
    for entry in entries_without_language:
        entry.language = english_language
        entry.save()
    print("migrated table!")
    

def create_language_test_data():
    print("creating languages...")
    if not Language.objects.filter(language_code='en').exists():
        Language.objects.create(name='english', native_name='english', language_code='en', currency='$')
        print("English language created")
    else:
        print("English language already exists")

    if not Language.objects.filter(language_code='de').exists():
        Language.objects.create(name='german', native_name='Deutsch', language_code='de', currency='€')
        print("German language created")
    else:
        print("German language already exists")