import os
from PIL import Image
from PIL import ImageOps

def generate_thumbnails(filepath):
    """
    ABOUT
        Routine that will take a full sized image path and generate
        an x,y sized thumbnail with the naming convention 
        name_thumb.extension
    INPUT
        Path to an image, any standard extension
    OUTPUT
        File path for an image of 1020,320 pixels
    TODO
        Make the image output size a parameter
    """

    # note if you change these guys you need to change templates and the project model
    sizeLarge = 1020,320
    sizeMed = 300, 94
    sizeSmall = 160, 50

    try:

        img = Image.open(filepath)
 
        path, image = os.path.split(filepath)

        path_large = os.path.join(path, '1020.320.' + image)
        img = ImageOps.fit(image=img, size=sizeLarge, method=Image.ANTIALIAS)
        img.save(path_large, img.format)

        path_medium = os.path.join(path, '300.94.' + image)
        img = ImageOps.fit(image=img, size=sizeMed, method=Image.ANTIALIAS)
        img.save(path_medium, img.format)

        path_small = os.path.join(path, '160.50.' + image)
        img = ImageOps.fit(image=img, size=sizeSmall, method=Image.ANTIALIAS)
        img.save(path_small, img.format)

        return True

    except IOError as e:
        print "IOError ", e
        return False


def generate_blurred_bg():
    # LV TODO

    return False;

