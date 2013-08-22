# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

import os
import yaml
import pyrax
import inspect

from flask import send_file, Blueprint, abort
from .helpers import _get_rackspace_container

container = _get_rackspace_container()

root_directory = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
settings = yaml.load(file(root_directory + '/config/rackspace.yml'))

rackspace_image_view = Blueprint( 'rackspace_image_view', __name__, url_prefix=settings['HOSTED_IMAGE_BASE_URI'])

@rackspace_image_view.route('/test')
def rackspace_test():

    from .helpers import _upload_image
    return str(_upload_image("/Users/lucasvickers/Desktop/test.jpg"))


@rackspace_image_view.route('/<image_name>')
def get_rackspace_image(image_name):
    """
    ABOUT

    METHOD

    INPUT

    OUTPUT

    PRECONDITIONS

    """


    base_path = settings['HOSTED_IMAGES_LOCAL_DIR']
    allowed_extensions = settings['ALLOWED_EXTENSIONS']
    # split it in case someone gets tricky w/ us

    head, image_name = os.path.split(image_name)

    file_name, file_extension = os.path.splitext(image_name)

    # they wanted a bad extension, just 404 it
    if file_extension not in settings['ALLOWED_EXTENSIONS']:
        abort(404)

    full_path = os.path.join(base_path, image_name)
    
    # if we find it just host it
    if os.path.isfile(full_path):
        return send_file( full_path )

    # if we didn't find it let's query the rackspace server
    try:
        file_object = container.get_object( image_name )
        file_object.download( base_path )

        # file should now exist
        return send_file( full_path )


    except pyrax.exceptions.NoSuchObject as e:
        # file doesn't exist in the cloud, 404 it
        abort(404)

    # otherwise default to 404
    abort(404)


