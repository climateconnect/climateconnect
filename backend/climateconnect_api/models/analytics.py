from django.db import models


class SiteAnalytics(models.Model):
    visitor_guid = models.CharField(
        max_length=36,
        help_text="Guid of the visitor. A randomly generated uuid",
        verbose_name="Visitor Guid",
        null=True,
        blank=True

    )
    visitor_is_authenticated = models.BooleanField(
        verbose_name="Visitor is Authenticated"
        ,help_text="Indicates whether the visitor is authenticated or not"
        ,null=False
        ,blank=False
        ,default=False
    )
    visitor_ip = models.CharField(
        max_length=39,
        help_text="IP of the visitor",
        verbose_name="Visitor's IP",
        null=True,
        blank=True

    )


    ##TODO
    ## Consider implementing https://github.com/ipinfo/python for getting location of IPs. 
    visitor_ip_country = models.CharField(
        max_length=39,
        help_text="Country of the IP of the visitor",
        verbose_name="IP's Country",
        null=True,
        blank=True

    )

    visitor_ip_city = models.CharField(
        max_length=39,
        help_text="City of the IP of the visitor",
        verbose_name="IP's City",
        null=True,
        blank=True

    )


    visit_url = models.CharField(
        max_length=4000,
        help_text="Visitor's URL",
        verbose_name="Visitor Entry Url",
        null=False,
        blank=False

    )

    visit_time = models.DateTimeField(
        help_text="Time at which the visit occured"

    )

    origin = models.TextField(
        max_length=4000,
        help_text="Visitor's origin of visit",
        verbose_name="Visitor Origin",
        null=True,
        blank=True      
    )



    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Time when language was created", verbose_name="Created at"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Time when language object was updated", verbose_name="Updated at"
    )