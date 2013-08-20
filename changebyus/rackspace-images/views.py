# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

import os
import yaml
import pyrax

from flask import send_file
from .helpers import _get_rackspace_container

container = _get_rackspace_container()

rackspace_image_view = Blueprint(  'rackspace_image_view', url_prefix=settings['HOSTED_IMAGE_BASE_URL'])

@rackspace_image_view.route('/<image_name>'):
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

    # they wanted a bad extension
    if file_extension not in settings['ALLOWED_EXTENSIONS']:
    	abort(403)

    full_path = os.path.join(base_path, image_name)
    
    # if we find it just host it
    if os.path.isfile(full_path):
    	return send_file( full_path )

    # if we didn't find it let's query the rackspace server
    try:
	    file_object = cf.get_object( file_name )
	    file_object.download( base_path )

	    # file should now exist
	    return send_file( full_path )


	except pyrax.exceptions.NoSuchObject as e:
		# file doesn't exist in the cloud, 404 it
		abort(404)

    # otherwise default to 404
    abort(404)


