import io
import secrets
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image
from climateconnect_api.models import UserProfile
from organization.models import Organization
from typing import Any

class Command(BaseCommand):
    help = "Convert png profile and org images to jpg with extra thumbnail image."    

    def handle(self, *args: Any, **options: Any) -> None:
        user_profiles_to_fix = UserProfile.objects.filter(thumbnail_image__exact='').exclude(image='')
        fix_accounts("profiles", user_profiles_to_fix)
        organizations_to_fix = Organization.objects.filter(thumbnail_image__exact='').exclude(image='')
        fix_accounts("organizations", organizations_to_fix)

def fix_accounts(name, elements):
    print("Total {name} to migrate to new image system: {number}".format(name=name, number=elements.count()))
    for element in elements:
        if(element.image):
            print("url_slug: " + element.url_slug)            
            element.image = get_image(element.image)
            element.thumbnail_image = get_image(element.image, True, 160)            
            element.save()

def get_image(image, resize=False, base_width=160):
    im = Image.open(image)
    jpg_im = im.convert('RGB')
    jpg_im_io = io.BytesIO()
    _filename, _extension = secrets.token_hex(20), "jpeg"
    if resize and jpg_im.size[0]>base_width:
            # resize
            w_percent    = (base_width/float(jpg_im.size[0]))
            h_size       = int((float(jpg_im.size[1])*float(w_percent)))
            jpg_im        = jpg_im.resize((base_width,h_size), Image.ANTIALIAS)
            
            # save resized image
            jpg_im.save(jpg_im_io, format=_extension)

            # generating the content of the new image
            return ContentFile( jpg_im_io.getvalue(), name=f"{_filename}.{_extension}" )
    else:
        jpg_im.save(jpg_im_io, format=_extension)
        return get_file_from_image(jpg_im_io, _filename, _extension)[0]

def get_file_from_image(image_io, _filename, _extension):
    file = ContentFile( image_io.getvalue(), name=f"{_filename}.{_extension}" )
    return file, ( _filename, _extension )