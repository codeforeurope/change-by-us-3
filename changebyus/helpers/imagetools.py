import os
from PIL import Image, ImageOps, ImageDraw
from flask import current_app


class NamedImage():
    def __init__(self, name=None, image=None, extension=None ):
        self.name = name
        self.image = image
        self.extension = extension


class ImageManipulator():
    def __init__(self, dict_name=None, converter=None, prefix=None, extension=None):
        self.dict_name = dict_name
        self.converter = converter
        self.prefix = prefix
        self.extension = extension


def generate_ellipse_png( filepath, size ):
    """

    """

    try:

        path, image = os.path.split(filepath)
        base, extension = os.path.splitext(image)
        print "making " , extension, " to .png"
        extension = '.png'

        sizeStr = ".{0}.{1}.ellipse".format( size[0], size[1] )
        name = base + sizeStr + extension

        mask = Image.new('L', size, 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse([0,0] + size, fill=255)
        im = Image.open( filepath )
        output = ImageOps.fit(im, mask.size, centering=(0.5, 0.5))
        output.putalpha(mask)

        print "name will be ", name

        resource = NamedImage( image=output, name=name, extension=extension )
        return resource

    except IOError as e:
        current_app.logger.exception(e)
        return None


def generate_thumbnail( filepath, size ):
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

    # TODO change it so it only takes a size

    try:

        img = Image.open(filepath)

        path, image = os.path.split(filepath)
        base, extension = os.path.splitext(image)

        sizeStr = ".{0}.{1}".format( size[0], size[1] )
        name = base + sizeStr + extension
        img = ImageOps.fit( image=img, size=size, method=Image.ANTIALIAS )

        resource = NamedImage( image=img, name=name, extension=extension )

        return resource

    except IOError as e:

        current_app.logger.exception(e)
        return None


def generate_blurred_bg():
    # LV TODO
    pass

def generate_circled_crop():
    # LV TODO
    pass
