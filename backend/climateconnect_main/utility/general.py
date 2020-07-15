# python standard lib
import base64, secrets, io

# django and pillow lib
from PIL import Image
from django.core.files.base import ContentFile

#source: https://dev.to/ageumatheus/creating-image-from-dataurl-base64-with-pyhton-django-454g
def get_image_from_data_url( data_url, resize=True, base_width=500 ):

    # getting the file format and the necessary dataURl for the file
    _format, _dataurl       = data_url.split(';base64,')
    # file name and extension
    _filename, _extension   = secrets.token_hex(20), _format.split('/')[-1]

    # generating the contents of the file
    file = ContentFile( base64.b64decode(_dataurl), name=f"{_filename}.{_extension}")
    # resizing the image, reducing quality and size
    if resize:

        # opening the file with the pillow
        image = Image.open(file)
        # using BytesIO to rewrite the new content without using the filesystem
        image_io = io.BytesIO()

        if image.size[0]>base_width:
            # resize
            w_percent    = (base_width/float(image.size[0]))
            h_size       = int((float(image.size[1])*float(w_percent)))
            image        = image.resize((base_width,h_size), Image.ANTIALIAS)

            # save resized image
            image.save(image_io, format=_extension)

            # generating the content of the new image
            file = ContentFile( image_io.getvalue(), name=f"{_filename}.{_extension}" )

    # file and filename
    return file, ( _filename, _extension )