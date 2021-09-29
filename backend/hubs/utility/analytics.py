from collections.abc import Sequence
from typing import Dict
from django.http import request
from climateconnect_api.models.analytics import SiteAnalytics
import logging
import traceback

logger = logging.getLogger(__name__)

SITE_VISIT_ORIGIN_QUERY_PARAM_TO_NAME_MAPPER = {'from_stickers':'Stickers_Campaign_20210930'}



def get_client_ip(request: request):
    try:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
    except:
        ip = 'IP Unknown'
    return ip

def process_url_visit_origin(analytics_params: Sequence
                            , url_kwargs: Dict
                            ,visit_time 
                            ,entry_url: str
                            ,visitor_guid: str
                            ,request: request
                            ,user_is_authenticated: bool
                            ):

    try:
        visitor_ip = get_client_ip(request=request)
        for analytics_param in analytics_params: 
            if analytics_param == 'from_stickers':
                origin = SITE_VISIT_ORIGIN_QUERY_PARAM_TO_NAME_MAPPER.get(analytics_param,'Origin Not Implemented')
                
        print(f"User is Authenticated: {user_is_authenticated}")
        SiteAnalytics.objects.create(
            visitor_guid=visitor_guid
            ,visitor_ip=visitor_ip
            ,visitor_ip_country=None
            ,visitor_ip_city=None
            ,visit_url=entry_url
            ,visit_time=visit_time
            ,origin=origin
            ,visitor_is_authenticated=user_is_authenticated
        )
    except:
        print("Visitor entry failed to be recorded. Traceback: \n {e}".format(e=traceback.format_exc()))


