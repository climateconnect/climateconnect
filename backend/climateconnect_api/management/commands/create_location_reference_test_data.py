from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from climateconnect_api.models import UserProfile
from hubs.models import Hub
from ideas.models import Idea
from location.models import Location
from organization.models import Organization, Project, ProjectStatus

DELETE_PREFIX = "TEST-REF-"


class Command(BaseCommand):
    help = "Creates test references (UserProfiles, Organizations, Projects, Hubs, Ideas) for specific Location IDs"

    def add_arguments(self, parser):
        parser.add_argument(
            "--delete",
            action="store_true",
            help="Delete all test reference data created by this command",
        )
        parser.add_argument(
            "--location-ids",
            nargs="+",
            type=int,
            default=[26574, 26793, 27265, 27866, 28788, 29018, 29252, 30059],
            
            help="Location IDs to create references for",

        )

    def handle(self, *args, **options):
        if options["delete"]:
            self.delete_test_data()
        else:
            self.create_test_data(options["location_ids"])

    def delete_test_data(self):
        # Delete Ideas with test prefix
        ideas_deleted, _ = Idea.objects.filter(name__startswith=DELETE_PREFIX).delete()
        self.stdout.write(f"Deleted {ideas_deleted} test ideas")

        # Delete Hubs with test prefix
        hubs_deleted, _ = Hub.objects.filter(name__startswith=DELETE_PREFIX).delete()
        self.stdout.write(f"Deleted {hubs_deleted} test hubs")

        # Delete Projects with test prefix
        projects_deleted, _ = Project.objects.filter(
            name__startswith=DELETE_PREFIX
        ).delete()
        self.stdout.write(f"Deleted {projects_deleted} test projects")

        # Delete Organizations with test prefix
        orgs_deleted, _ = Organization.objects.filter(
            name__startswith=DELETE_PREFIX
        ).delete()
        self.stdout.write(f"Deleted {orgs_deleted} test organizations")

        # Delete UserProfiles and Users with test prefix
        test_users = User.objects.filter(username__startswith=DELETE_PREFIX.lower())
        profiles_deleted = test_users.count()
        test_users.delete()
        self.stdout.write(f"Deleted {profiles_deleted} test users/profiles")

        self.stdout.write(self.style.SUCCESS("Test reference data deleted!"))

    def create_test_data(self, location_ids):
        # Get or create a ProjectStatus (use first existing one if available)
        status = ProjectStatus.objects.first()
        if not status:
            status = ProjectStatus.objects.create(
                name="In Progress",
                name_de_translation="In Bearbeitung",
                status_type=ProjectStatus.IN_PROGRESS_TYPE,
                has_end_date=False,
                has_start_date=True,
            )

        created_users = 0
        created_orgs = 0
        created_projects = 0
        created_hubs = 0
        created_ideas = 0

        for i, loc_id in enumerate(location_ids):
            try:
                location = Location.objects.get(id=loc_id)
            except Location.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Location {loc_id} not found, skipping")
                )
                continue

            loc_name = location.city or location.name or f"loc{loc_id}"

            if i == 3:
                # Create a test user with profile
                username = f"{DELETE_PREFIX.lower()}user-{loc_id}"
                user = None
                if not User.objects.filter(username=username).exists():
                    user = User.objects.create_user(
                        username=username,
                        email=f"test-{loc_id}@example.com",
                        password="testpassword123",
                        first_name="Test",
                        last_name=f"User {loc_id}",
                    )
                    # Create the UserProfile (no auto-creation signal exists)
                    UserProfile.objects.create(
                        user=user,
                        location=location,
                        name=f"Test User {loc_name}",
                    )
                    created_users += 1
                else:
                    user = User.objects.get(username=username)

            if i == 1:
                # Create a test organization (use loc_id for unique names)
                org_name = f"{DELETE_PREFIX}Org {loc_id} {loc_name}"
                if not Organization.objects.filter(url_slug=f"test-org-{loc_id}").exists():
                    Organization.objects.create(
                        name=org_name,
                        url_slug=f"test-org-{loc_id}",
                        location=location,
                        short_description=f"Test organization in {loc_name}",
                    )
                    created_orgs += 1

            if False:
                # Create a test project (use loc_id for unique names)
                project_name = f"{DELETE_PREFIX}Project {loc_id} {loc_name}"
                if not Project.objects.filter(url_slug=f"test-project-{loc_id}").exists():
                    Project.objects.create(
                        name=project_name,
                        url_slug=f"test-project-{loc_id}",
                        loc=location,
                        status=status,
                        short_description=f"Test project in {loc_name}",
                        is_draft=False,
                    )
                    created_projects += 1

            if i == 1:
                # Create a test hub (use loc_id for unique names, ManyToMany location)
                hub_name = f"{DELETE_PREFIX}Hub {loc_id} {loc_name}"
                if not Hub.objects.filter(url_slug=f"test-hub-{loc_id}").exists():
                    hub = Hub.objects.create(
                        name=hub_name,
                        url_slug=f"test-hub-{loc_id}",
                        headline=f"Test Hub for {loc_name}",
                        hub_type=Hub.LOCATION_HUB_TYPE,
                        segway_text=f"Test segway text for {loc_name}",
                        quick_info=f"Quick info about test hub in {loc_name}",
                    )
                    hub.location.add(location)
                    created_hubs += 1

            if False:
                # Create a test idea (use loc_id for unique names)
                idea_name = f"{DELETE_PREFIX}Idea {loc_id} {loc_name}"
                if not Idea.objects.filter(url_slug=f"test-idea-{loc_id}").exists():
                    Idea.objects.create(
                        name=idea_name,
                        url_slug=f"test-idea-{loc_id}",
                        short_description=f"Test idea in {loc_name}",
                        location=location,
                        user=user,
                    )
                    created_ideas += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created_users} users, {created_orgs} organizations, "
                f"{created_projects} projects, {created_hubs} hubs, "
                f"{created_ideas} ideas for {len(location_ids)} locations"
            )
        )
