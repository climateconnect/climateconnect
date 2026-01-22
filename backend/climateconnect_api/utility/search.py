from concurrent.futures import ThreadPoolExecutor
from climateconnect_api.models.user import UserProfile 

from organization.models import Organization 
from organization.models import Project 
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.db.models import Value



def _search_project(input_text:str):
    #https://docs.djangoproject.com/en/4.1/ref/contrib/postgres/search/
    vector = SearchVector('description','short_description','name')
    search_query = SearchQuery(input_text)
    data = Project.objects.annotate(rank=SearchRank(vector, search_query, cover_density=True)).order_by('-rank')[:10]
    serialize_data = lambda p:{"name":p.name, "description":p.description if len(p.short_description)==0 else p.short_description,"url":p.url_slug, "short":p.short_description,"rank":p.rank }
    return list(map(serialize_data,data))

def _search_profile(input_text:str):
    #https://docs.djangoproject.com/en/4.1/ref/contrib/postgres/search/
    vector = SearchVector('skills','name')
    search_query = SearchQuery(input_text)
    data = UserProfile.objects.annotate(rank=SearchRank(vector, search_query, cover_density=True)).order_by('-rank')[:10]
    serialize_data = lambda p:{"name":p.name ,"url":p.url_slug, "rank":p.rank }
    return list(map(serialize_data,data))

def _search_organization(input_text:str):
    #https://docs.djangoproject.com/en/4.1/ref/contrib/postgres/search/
    vector = SearchVector('about','name','short_description','website')
    search_query = SearchQuery(input_text)
    data = Organization.objects.annotate(rank=SearchRank(vector, search_query, cover_density=True)).order_by('-rank')[:10]
    serialize_data = lambda p:{"name":p.name, "short_description":p.short_description,"website":p.website,"about":p.about, "url":p.url_slug ,"rank":p.rank }
    return list(map(serialize_data,data))


def cross_search(input_text:str):
    #_profiles = []
    _projects = []
    _organizations = []
    try:
        with ThreadPoolExecutor(max_workers=3) as tpe:
            threads = {
                "projects": tpe.submit(_search_project,input_text),
                "organizations": tpe.submit(_search_organization,input_text),
                #"profiles": tpe.submit(_search_profile,input_text),
            }
            
        results = {#"profiles":threads['profiles'].result()
        "projects":threads['projects'].result()
        , "organizations":threads['organizations'].result()}

        print(results)

    except Exception as E:
        raise Exception(E) 

    return results

