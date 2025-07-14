import random
import os

from django.utils import timezone

from django.core.management.base import BaseCommand
from django.db.models.deletion import ProtectedError

from climateconnect_api.models.common import Availability
from climateconnect_api.models.language import Language
from climateconnect_api.models.role import Role
from climateconnect_api.models.user import UserProfile
from organization.models.members import ProjectMember
from organization.models.project import Project, ProjectParents
from organization.models.status import ProjectStatus
from organization.models.tags import ProjectTagging, ProjectTags
from hubs.models.hub import Hub

TEST_PREFIX = "T-SECTOR"
TESTING_LIMIT = 50
TESTING = True


class ProjectTagDef:
    def __init__(self, name, key, parent_tag=None):
        self.name = name
        self.key = key
        self.parent_tag = parent_tag
        if TESTING:
            self.name = f"{TEST_PREFIX}-{name}"


DEFINITIONS = [
    ProjectTagDef("Air", "air"),
    ProjectTagDef("Fighting air pollution", "fightingairpollution", "air"),
    ProjectTagDef("Buildings", "buildings"),
    ProjectTagDef("Construction", "construction", "buildings"),
    ProjectTagDef("Energetic renovation", "energeticrenovation", "buildings"),
    ProjectTagDef("Room cooling", "roomcooling", "buildings"),
    ProjectTagDef("Room heating", "roomheating", "buildings"),
    ProjectTagDef("Climate change adaption", "climatechangeadaption"),
    ProjectTagDef(
        "Building resilience to climate-related disasters",
        "buildingresiliencetoclimate-relateddisasters",
        "climatechangeadaption",
    ),
    ProjectTagDef(
        "Education on climate change adaption",
        "educationonclimatechangeadaption",
        "climatechangeadaption",
    ),
    ProjectTagDef("Climate justice", "climatejustice"),
    ProjectTagDef(
        "Fighting discrimination", "fightingdiscrimination", "climatejustice"
    ),
    ProjectTagDef("Protecting human rights", "protectinghumanrights", "climatejustice"),
    ProjectTagDef(
        "Supporting global social justice",
        "supportingglobalsocialjustice",
        "climatejustice",
    ),
    ProjectTagDef(
        "Supporting marginalized groups",
        "supportingmarginalizedgroups",
        "climatejustice",
    ),
    ProjectTagDef("Education & Social action", "education&socialaction"),
    ProjectTagDef(
        "Climate change sensibilisation",
        "climatechangesensibilisation",
        "education&socialaction",
    ),
    ProjectTagDef(
        "Demonstrations & strikes", "demonstrations&strikes", "education&socialaction"
    ),
    ProjectTagDef("Education", "education", "education&socialaction"),
    ProjectTagDef(
        "Encouraging climate-friendly lifestyle",
        "encouragingclimate-friendlylifestyle",
        "education&socialaction",
    ),
    ProjectTagDef("Petition", "petition", "education&socialaction"),
    ProjectTagDef("Energy", "energy"),
    ProjectTagDef("Biomass energy", "biomassenergy", "energy"),
    ProjectTagDef("Energy distribution", "energydistribution", "energy"),
    ProjectTagDef("Energy storage", "energystorage", "energy"),
    ProjectTagDef("Green fuels", "greenfuels", "energy"),
    ProjectTagDef("Hydrogen", "hydrogen", "energy"),
    ProjectTagDef("Hydropower energy", "hydropowerenergy", "energy"),
    ProjectTagDef("Improving energy efficiency", "improvingenergyefficiency", "energy"),
    ProjectTagDef(
        "Making fossil fuel technology cleaner",
        "makingfossilfueltechnologycleaner",
        "energy",
    ),
    ProjectTagDef("Nuclear energy", "nuclearenergy", "energy"),
    ProjectTagDef("Other renewable energy", "otherrenewableenergy", "energy"),
    ProjectTagDef("Solar & photovoltaic energy", "solar&photovoltaicenergy", "energy"),
    ProjectTagDef("Wind energy", "windenergy", "energy"),
    ProjectTagDef("Event", "event"),
    ProjectTagDef("Food", "food"),
    ProjectTagDef(
        "Encouraging a plant-based lifestyle",
        "encouragingaplant-basedlifestyle",
        "food",
    ),
    ProjectTagDef("Food production", "foodproduction", "food"),
    ProjectTagDef("Gastronomy/Catering", "gastronomy/catering", "food"),
    ProjectTagDef("Lowering food waste", "loweringfoodwaste", "food"),
    ProjectTagDef("Funding", "funding"),
    ProjectTagDef("Geoengineering", "geoengineering"),
    ProjectTagDef("Greenhouse gas capture", "greenhousegascapture", "geoengineering"),
    ProjectTagDef("Greenhouse gas reuse", "greenhousegasreuse", "geoengineering"),
    ProjectTagDef("Greenhouse gas storage", "greenhousegasstorage", "geoengineering"),
    ProjectTagDef("Land use", "landuse"),
    ProjectTagDef(
        "Afforestation/Reforestation", "afforestation/reforestation", "landuse"
    ),
    ProjectTagDef(
        "Climate-friendly agriculture", "climate-friendlyagriculture", "landuse"
    ),
    ProjectTagDef(
        "Conserving/restoring land ecosystems",
        "conserving/restoringlandecosystems",
        "landuse",
    ),
    ProjectTagDef(
        "Conserving/restoring peatlands", "conserving/restoringpeatlands", "landuse"
    ),
    ProjectTagDef(
        "Conserving/restoring permafrost", "conserving/restoringpermafrost", "landuse"
    ),
    ProjectTagDef("Fighting biodiversity loss", "fightingbiodiversityloss", "landuse"),
    ProjectTagDef("Fighting deforestation", "fightingdeforestation", "landuse"),
    ProjectTagDef(
        "Restoring degraded land/soil", "restoringdegradedland/soil", "landuse"
    ),
    ProjectTagDef(
        "Sustainable forest management", "sustainableforestmanagement", "landuse"
    ),
    ProjectTagDef("Mobility", "mobility"),
    ProjectTagDef("Air transportation", "airtransportation", "mobility"),
    ProjectTagDef("Freight transport", "freighttransport", "mobility"),
    ProjectTagDef("Land transportation", "landtransportation", "mobility"),
    ProjectTagDef("Passenger transport", "passengertransport", "mobility"),
    ProjectTagDef("Transport infrastructure", "transportinfrastructure", "mobility"),
    ProjectTagDef("Water transportation", "watertransportation", "mobility"),
    ProjectTagDef("Policy & Governance", "policy&governance"),
    ProjectTagDef("Climate consulting", "climateconsulting", "policy&governance"),
    ProjectTagDef("Climate lobbyism", "climatelobbyism", "policy&governance"),
    ProjectTagDef(
        "Fighting climate-unfriendly subsidies",
        "fightingclimate-unfriendlysubsidies",
        "policy&governance",
    ),
    ProjectTagDef(
        "Fighting environmental corruption",
        "fightingenvironmentalcorruption",
        "policy&governance",
    ),
    ProjectTagDef("Implementing policy", "implementingpolicy", "policy&governance"),
    ProjectTagDef("Policy suggestions", "policysuggestions", "policy&governance"),
    ProjectTagDef("Product", "product"),
    ProjectTagDef(
        "Production, consumption and recycling", "production,consumptionandrecycling"
    ),
    ProjectTagDef(
        "Circular economy", "circulareconomy", "production,consumptionandrecycling"
    ),
    ProjectTagDef(
        "Climate-friendly fashion",
        "climate-friendlyfashion",
        "production,consumptionandrecycling",
    ),
    ProjectTagDef(
        "Climate-friendly production practices",
        "climate-friendlyproductionpractices",
        "production,consumptionandrecycling",
    ),
    ProjectTagDef("Recycling", "recycling", "production,consumptionandrecycling"),
    ProjectTagDef(
        "Reducing climate-unfriendly consumption",
        "reducingclimate-unfriendlyconsumption",
        "production,consumptionandrecycling",
    ),
    ProjectTagDef(
        "Reducing waste", "reducingwaste", "production,consumptionandrecycling"
    ),
    ProjectTagDef(
        "Sustainable use of natural resources",
        "sustainableuseofnaturalresources",
        "production,consumptionandrecycling",
    ),
    ProjectTagDef("Research", "research"),
    ProjectTagDef(
        "Research in natural science", "researchinnaturalscience", "research"
    ),
    ProjectTagDef("Research in social science", "researchinsocialscience", "research"),
    ProjectTagDef("Research in technology", "researchintechnology", "research"),
    ProjectTagDef("Water", "water"),
    ProjectTagDef(
        "Fighting ocean acidification", "fightingoceanacidification", "water"
    ),
    ProjectTagDef("Fighting overfishing", "fightingoverfishing", "water"),
    ProjectTagDef(
        "Improving water use efficiency", "improvingwateruseefficiency", "water"
    ),
    ProjectTagDef(
        "Protecting marine ecosystems", "protectingmarineecosystems", "water"
    ),
    ProjectTagDef("Reducing marine pollution", "reducingmarinepollution", "water"),
    ProjectTagDef("Water recycling", "waterrecycling", "water"),
]

SECTORS = {
    "food": "food",
    "landuse": "landuse",
    "construction": "construction",
    "energy": "energy",
    "education": "education",
    "mobility": "mobility",
}


def create_project_tag(tagdef: ProjectTagDef):
    if ProjectTags.objects.filter(key=tagdef.key).exists():
        print(
            "[x]\tProject tag with key {} already exists. Skipping tag {}".format(
                tagdef.key, tagdef.name
            )
        )
        return

    if tagdef.parent_tag:
        parent_tag = ProjectTags.objects.filter(key=tagdef.parent_tag).first()
        if not parent_tag:
            print(
                "[x]\tParent tag with key {} does not exist. Skipping tag {}".format(
                    tagdef.parent_tag, tagdef.name
                )
            )
            return
        ProjectTags.objects.create(
            name=tagdef.name,
            parent_tag=parent_tag,
            key=tagdef.key,
        )
        print(f"[✓]\t{tagdef.name} created")
    else:
        ProjectTags.objects.create(
            name=tagdef.name,
            key=tagdef.key,
        )
        print(f"[✓]\t{tagdef.name} created")


def create_project_for(key, tags):
    english_language = Language.objects.filter(language_code="en")[0]

    name = f"{TEST_PREFIX}-{key}"
    url_slug = name.replace(" ", "")

    if not Project.objects.filter(name=name).exists():
        # Buffer some start date to create more
        # sense of older projects. This originated out of
        # fixing a bug around the "timeago" utility, where
        # timeago would round up to 2 years, when a project
        # is only 1 year and 1 day old. This should create the
        # UTC timestamp, e.g. 2020-02-04T01:33:45.276997Z
        one_year_and_one_day_ago = timezone.now() - timezone.timedelta(days=366)

        project = Project.objects.create(
            name=name,
            city="SECTOR_TEST_DATA",
            collaborators_welcome=True,
            country="Germany",
            short_description="This is a test project.",
            start_date=one_year_and_one_day_ago,
            status=ProjectStatus.objects.get(name="In Progress"),
            url_slug=url_slug,
            language=english_language,
        )

        parent_user = UserProfile.objects.all()[1].user

        ProjectParents.objects.create(project=project, parent_user=parent_user)
        admin_role = Role.objects.get(role_type=Role.ALL_TYPE)
        all_availabilities = list(Availability.objects.all())
        example_availability = random.choice(all_availabilities)
        ProjectMember.objects.create(
            project=project,
            user=parent_user,
            role=admin_role,
            availability=example_availability,
            role_in_project="Project manager",
        )

        for tag in tags:
            ProjectTagging.objects.create(
                project=project,
                project_tag=tag,
            )
        print("[✓]\t{} project created.".format(name))
        return True
    else:
        print("[x]\t{} project already exists.".format(name))
        return False


def create_all_project_tags():
    print("Creating project tags test data...")
    for tagdef in DEFINITIONS:
        create_project_tag(tagdef)
    print("finished creating project tags test data!")


def create_projects_related_to_tags():
    print("-" * 40)
    print("Creating test data: projects with one tag ...")
    successes = []
    fails = []

    for tagdef in DEFINITIONS:
        tag = ProjectTags.objects.filter(key=tagdef.key).first()
        if not tag:
            print(
                "[!]\tTag with key {} does not exist. Skipping tag {}".format(
                    tagdef.key, tagdef.name
                )
            )
            continue

        key = tagdef.key + "-project"
        ret = create_project_for(key, [tag])

        # reporting
        if ret:
            successes.append([key, [tag]])
        else:
            fails.append([key, [tag]])

    print("-" * 40)
    print("Creating test data: projects with two tag ...")

    for i, tagdef1 in enumerate(DEFINITIONS):
        for j, tagdef2 in enumerate(DEFINITIONS):
            if i >= j:
                continue
            # print("i: {}, j: {}".format(i, j))
            # print(tagdef1.key, tagdef2.key)
            tag1 = ProjectTags.objects.filter(key=tagdef1.key).first()
            tag2 = ProjectTags.objects.filter(key=tagdef2.key).first()
            if not tag1 or not tag2:
                print(
                    "[!]\tTag with key {} does not exist. Skipping tag {}".format(
                        tagdef.key, tagdef.name
                    )
                )
                continue

            key = tagdef1.key + "&" + tagdef2.key + "-project"
            ret = create_project_for(key, [tag1, tag2])

            # reporting
            if ret:
                successes.append([key, [tag1, tag2]])
            else:
                fails.append([key, [tag1, tag2]])

    # reporting:
    print()
    print("finished creating project tags test data!")
    print("successes:", len(successes))
    print()
    print("fails")
    for key, taggings in fails:
        print("[!] >>" + key + "\t\t" + ",".join(taggings))
    print()
    print("fails:", len(fails))
    print("-" * 50)


def __safe_file_read(path):
    try:
        return open(path, "rb")
    except OSError as e:
        print(f"Failed to open {path}: {e}")
        return None


def create_sector_hubs(name: str, slug: str, project_tags: list):
    if Hub.objects.filter(url_slug=slug).exists():
        print(
            "[x]\tHub with slug {} already exists. Skipping hub {}".format(slug, name)
        )
        return

    # prepare the background image
    bg_path = "climateconnect_api/management/commands/res/" + slug + ".jpg"

    if not os.path.exists(bg_path):
        print(f"[!] Background image file {bg_path} not found. Skipping {slug}.")
        return

    background_file = __safe_file_read(bg_path)
    if background_file is None:
        print(f"[!] Background image file {bg_path} not found. Skipping {slug}.")
        return

    # prepare the icon image
    icon_path = "climateconnect_api/management/commands/res/" + slug + ".svg"

    if not os.path.exists(icon_path):
        print(f"[!] Icon image file {icon_path} not found. Skipping {slug}.")
        return

    icon_file = __safe_file_read(icon_path)
    if icon_file is None:
        print(f"[!] Icon image file {icon_path} not found. Skipping {slug}.")
        return

    # Create the hub
    hub = Hub.objects.create(
        name=TEST_PREFIX + "-" + name,
        url_slug=slug,
        headline="headline",
        sub_headline="sub_headline",
        hub_type=Hub.SECTOR_HUB_TYPE,
        segway_text="lorem ipsum - segway text",
        language=Language.objects.filter(language_code="en")[0],
    )

    hub.image_attribution = f"{slug} - image attribution"

    hub.image.save(
        slug + ".jpg",
        content=background_file,
        save=True,
    )

    hub.thumbnail_image.save(
        slug + ".jpg",
        content=background_file,
        save=True,
    )

    hub.icon.save(
        slug + ".svg",
        content=icon_file,
        save=True,
    )

    for tag_name in project_tags:
        tag = ProjectTags.objects.filter(key=tag_name).first()
        if tag is None:
            continue
        hub.filter_parent_tags.add(tag)

    hub.save()

    print("[+]\t{} hub created\t\t(/{})".format(name, slug))
    pass


def create_all_sector_hubs():
    for name, tags in SECTORS.items():
        create_sector_hubs(name, name, [tags])
        pass


###############################################
# delete all tags whose name starts with "T-SECTOR"
# delete all projects whose name starts with "T-SECTOR"
# delete all hubs whose name starts with "T-SECTOR"
###############################################
def delete_t_sector_tags():
    ok = input(
        "This will delete all tags whose name starts with 'T-SECTOR'. Are you sure? (y/n)"
    )
    if ok.lower().strip() != "y":
        print("Aborting...")
        return

    changed = True
    # iterativly try too delete all testdata, to walk back the tree ...
    # cascade on delete is missing ._.
    while changed:
        changed = False
        for tag in ProjectTags.objects.filter(name__startswith=TEST_PREFIX):
            try:
                tag.delete()
                print(f"[-]\tTag {tag.name} deleted")
                changed = True
            except ProtectedError:
                print(f"[!]\tTag {tag.name} skipped, currently protected")


def delete_t_sector_projects():
    ok = input(
        "This will delete all projects whose name starts with 'T-SECTOR'. Are you sure? (y/n)"
    )
    if ok.lower().strip() != "y":
        print("Aborting...")
        return

    for project in Project.objects.filter(name__startswith=TEST_PREFIX):
        project.delete()
        print(f"[-]\tProject {project.name} deleted")


def delete_t_sector_hubs():
    ok = input(
        "This will delete all hubs whose name starts with 'T-SECTOR'. Are you sure? (y/n)"
    )
    if ok.lower().strip() != "y":
        print("Aborting...")
        return

    for hub in Hub.objects.filter(name__startswith=TEST_PREFIX):
        hub.delete()
        print(f"[-]\tHub {hub.name} deleted")


class Command(BaseCommand):
    help = "Create badges data for users"

    def add_arguments(self, parser):
        parser.add_argument(
            "--delete",
            action="store_true",
            help="Delete all hubs whose name starts with 'T-SECTOR'",
        )
        parser.add_argument(
            "-n",
            "--number",
            type=int,
            help="Limit the number of generated ProjectTags",
        )

    def handle(self, *args, **options) -> str:
        # dynamicly set the testing limit
        if options.get("number"):
            global TESTING_LIMIT
            global DEFINITIONS

            TESTING_LIMIT = options.get("number")
            if TESTING_LIMIT <= 0 and TESTING_LIMIT != -1:
                print("[Usage]: Number must be greater than 0 or -1")
                return

            print(f"Limiting number of generated ProjectTags to {TESTING_LIMIT}")
            DEFINITIONS = DEFINITIONS[:TESTING_LIMIT]

        # delete all test data
        if options.get("delete"):
            delete_t_sector_hubs()
            delete_t_sector_projects()
            delete_t_sector_tags()
            return

        create_all_project_tags()
        create_projects_related_to_tags()
        create_all_sector_hubs()
