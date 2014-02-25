# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

"""
.. module:: imagetools

    :synopsis: A set of tools for manipulating images and generating resized images

"""

import os
from PIL import Image, ImageOps, ImageDraw, ImageFilter
from flask import current_app as app
from flask.ext.cdn import url_for
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
        

def gen_image_urls(filename, format_list):

    """
        Helper that will take a root image name, and given our image manipulators
        and preferred remote storage container will generate image names and urls.

        Example: happycat.jpg will have the imges 
        250.250.happycat.png
        300.300.happycat.jpg
        etc

        Args:
            filename = Base image name
            format_list = list of ImageManipulator objects for resultant derivatives
        Returns:
            a dict of multiple {image_name : image_url}
    """

    images = {}

    root_image = filename if filename is not None else app.settings['DEFAULT_PROJECT_IMAGE']

    for manipulator in format_list:
        base, extension = os.path.splitext(root_image)
        name = manipulator.prefix + "." + base + manipulator.extension
        images [ manipulator.dict_name ] = url_for( 'static', filename = name )

    return images


def generate_ellipse_png( filepath, size, blurs = 0 ):
    """Creates a png image that has an eliptical alpha border

        Args:
            filepath: local path to the image
            size: a list representing the size, such as [100,100]
            blurs: the number of blur filters we should apply to the image

        Returns:
            A NamedImage class with the photo information
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
        app.logger.exception(e)
        return None


def generate_thumbnail( filepath, size, blurs=0, brightness=1.0 ):
    """Creates a resized image of the original image

        Args:
            filepath: local path to the image
            size: a list representing the size, such as [100,100]
            blurs: the number of blur filters we should apply to the image

        Returns:
            A NamedImage class with the photo information
    """

    # note if you change these guys you need to change templates and the project model

    # TODO change it so it only takes a size

    try:

        img = Image.open(filepath)

        if blurs:
            img = img.filter(ImageFilter.GaussianBlur(radius=blurs))
            
        if brightness and brightness != 1.0:
            img = img.point(lambda p: p * brightness)

        path, image = os.path.split(filepath)
        base, extension = os.path.splitext(image)

        sizeStr = ".{0}.{1}".format( size[0], size[1] )
        name = base + sizeStr + extension
        img = ImageOps.fit( image=img, size=size, method=Image.ANTIALIAS )


        resource = NamedImage( image=img, name=name, extension=extension )

        return resource

    except IOError as e:

        app.logger.exception(e)
        return None


def upload_image(photo, manipulators):
    """
        Routine that will take a photo and a list of photo manipulators,
        run the image through the various image manipulators, and upload those
        images to our cloud container.

        Args:
            photo: file path to the original file
            manipulators: a list of ImageManipulators to run the image through

        Returns:
            The base name of the image

    """


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
            app.logger.exception(e)
            return None

        file_name = result.name

    return file_name
