import os
from PIL import Image, ImageOps, ImageDraw, ImageFilter
from flask import current_app
from flask.ext.cdn_rackspace import upload_rackspace_image

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


def generate_ellipse_png( filepath, size, blurs = 0 ):
    """

    """

    try:

        path, image = os.path.split(filepath)
        base, extension = os.path.splitext(image)
        extension = '.png'

        sizeStr = ".{0}.{1}.ellipse".format( size[0], size[1] )
        name = base + sizeStr + extension

        mask = Image.new('L', size, 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse([0,0] + size, fill=255)
        im = Image.open( filepath )

        # filter
        for i in range(blurs):
            im = im.filter(ImageFilter.BLUR)

        output = ImageOps.fit(im, mask.size, centering=(0.5, 0.5))
        output.putalpha(mask)

        resource = NamedImage( image=output, name=name, extension=extension )
        return resource

    except IOError as e:
        current_app.logger.exception(e)
        return None


def generate_thumbnail( filepath, size, blurs = 0 ):
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

        # filter
        for i in range(blurs):
            img = img.filter(ImageFilter.BLUR)

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


def upload_image(photo, manipulators):

    file_name = None

    if len(photo.filename) > 3:

        try:
            result = upload_rackspace_image( photo )

            if result.success:
                file_name = result.name
                file_path = result.path
                image_url = result.url

                for manipulator in manipulators:

                    manip_image = manipulator.converter(file_path)
                    base, extension = os.path.splitext(file_name)
                    manip_image_name = manipulator.prefix + '.' + base + manipulator.extension

                    if not upload_rackspace_image( manip_image.image, 
                                                   manip_image_name).success:

                        return None
            else:
                return None

        except Exception as e:
            current_app.logger.exception(e)
            return None

        file_name = result.name

    return file_name
