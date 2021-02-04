from organization.models.tags import ProjectTagging, ProjectTags
from organization.models.project import ProjectParents
from django.core.management.base import BaseCommand

from django.utils import timezone
from django.contrib.auth.models import User

from climateconnect_api.models import (
    Availability, Role, UserProfile
)
from organization.models import (
    ProjectStatus, Project, Organization
)


def create_test_user_data(number_of_rows: int):
    print("Creating users...")
    for i in range(number_of_rows):
        username = "test{}@test.com".format(i)
        name = "test {}".format(i)
        url_slug = name.replace(" ", "")
        if not User.objects.filter(email=username).exists():
            user = User.objects.create(
                username=username, email=username,
                first_name="Test", last_name=str(i)
            )
            UserProfile.objects.create(
                user=user, name=name, url_slug=url_slug,
                country="Germany", is_profile_verified=True,
                city="Test {}".format(i)
            )
            print("{} User created".format(username))
        else:
            print("{} User already exists".format(username))


def create_availability_test_data(number_of_rows: int):
    # Based on number of rows you can create test data for availability table.
    print("Creating user availabilities...")
    for i in range(number_of_rows):
        name = "{}-{} hours per week".format(i, i+1)
        key = name.replace(" ", "")
        if not Availability.objects.filter(name=name).exists():
            Availability.objects.create(name=name, key=key)
        else:
            print("{} user availability already exists.".format(name))


def create_roles_test_data():
    # Creating 2 roles here
    print("Creating project roles...")

    if not Role.objects.filter(name='Creator').exists():
        Role.objects.create(
            name='Creator', role_type=Role.ALL_TYPE
        )
        print("Creator role is successfully created.")
    else:
        print("Creator role already exists.")

    if not Role.objects.filter(name='Member').exists():
        Role.objects.create(
            name='Member', role_type=Role.READ_ONLY_TYPE
        )
        print("Member role successfully created.")
    else:
        print("Member role already exists.")

    if not Role.objects.filter(name='Administrator').exists():
        Role.objects.create(
            name='Administrator', role_type=Role.READ_WRITE_TYPE
        )
        print("Administrator role successfully created.")
    else:
        print("Administrator role already exists.")


def create_project_status_test_data():
    # Creating 2 project status
    print("Creating project status...")
    if not ProjectStatus.objects.filter(name='In Progress').exists():
        ProjectStatus.objects.create(name='In Progress', has_end_date=True, has_start_date=True)
        print("In Progress status created.")
    else:
        print("In Progress project status already exists.")

    if not ProjectStatus.objects.filter(name='Recurring').exists():
        ProjectStatus.objects.create(name='Recurring', has_end_date=False, has_start_date=True)
        print("Recurring project status created.")
    else:
        print("Recurring project status already exists.")


def create_organization_test_data(number_of_rows: int):
    print("Creating orgranization data...")
    for i in range(number_of_rows):
        name = "Test Org {}".format(i)
        url_slug = name.replace(" ", "")
        if not Organization.objects.filter(name=name).exists():
            Organization.objects.create(
                name=name, url_slug=url_slug,
                country="Germany", short_description="This is a test organization",
                city="Test {}".format(i)
            )
            print("{} organization created.".format(name))
        else:
            print("{} orgranization already exists.".format(name))

def create_project_tags_test_data():
    print("Creating project tags test data...")
    if not ProjectTags.objects.filter(name='Food').exists():
        food_tag = ProjectTags.objects.create(name='Food', key='food')
        if not ProjectTags.objects.filter(name='Lowering Food waste').exists():
            ProjectTags.objects.create(
                name='Lowering food waste',
                key='loweringfoodwaste',
                parent_tag=food_tag
            )
        if not ProjectTags.objects.filter(name='Encouraging a plant-based lifestyle').exists():
            ProjectTags.objects.create(
                name='Encouraging a plant-based lifestyle',
                key='encouragingaplantbasedlifestyle',
                parent_tag=food_tag
            )
    if not ProjectTags.objects.filter(name='Transportation').exists():
        ProjectTags.objects.create(name='Transportation', key='transportation')
    if not ProjectTags.objects.filter(name='Energy').exists():
        ProjectTags.objects.create(name='Energy', key='energy')
    print("finished creating project tags test data!")

def create_project_test_data(number_of_rows: int):
    print("Creating project data...")

    for i in range(number_of_rows):
        name = "Test project {}".format(i)
        url_slug = name.replace(" ", "")

        if not Project.objects.filter(name=name).exists():
            # Buffer some start date to create more
            # sense of older projects. This originated out of
            # fixing a bug around the "timeago" utility, where
            # timeago would round up to 2 years, when a project
            # is only 1 year and 1 day old. This should create the
            # UTC timestamp, e.g. 2020-02-04T01:33:45.276997Z
            one_year_and_one_day_ago = timezone.now() - timezone.timedelta(days = 366)

            project = Project.objects.create(
                name=name,
                city="Test {}".format(i),
                collaborators_welcome=True,
                country="Germany",
                short_description="This is a test project.",
                start_date=one_year_and_one_day_ago,
                status=ProjectStatus.objects.get(name="In Progress"),
                url_slug=url_slug,
            )

            parent_user = User.objects.all()[i]
            ProjectParents.objects.create(
                project=project,
                parent_user=parent_user
            )

            number_of_test_project_tags = 5
            ProjectTagging.objects.create(
                project=project,
                project_tag=ProjectTags.objects.all()[int((i/number_of_rows)*number_of_test_project_tags)]
            )
            print("{} project created.".format(name))
        else:
            print("{} project already exists.".format(name))



class Command(BaseCommand):
    help = "Creates test data of user's availability to volunteer to an organization."

    def add_arguments(self, parser) -> None:
        number_of_rows = parser.add_argument("--number_of_rows", dest="number_of_rows", type=int)

    def handle(self, *args, **options) -> str:
        number_of_rows = options['number_of_rows']

        create_test_user_data(number_of_rows=number_of_rows)
        create_availability_test_data(number_of_rows=number_of_rows)
        create_roles_test_data()
        create_project_status_test_data()
        create_organization_test_data(number_of_rows=number_of_rows)
        create_project_tags_test_data()
        create_project_test_data(number_of_rows=number_of_rows)
