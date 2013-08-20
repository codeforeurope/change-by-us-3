# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

import os
import random

from collections import namedtuple
from flask import current_app, g


def string_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for x in range(size))


def _upload_image(local_image_path):
	pass

	"""
	unfortunately the following needs to happen

	- test that it's an allowed extension
	- test to see if the file name is OK locally
	- test to see if the file name is OK remotely
	- generate file names
	"""


    UploadedImage = namedtuple('UploadedImage', 'success name')

    base_path = settings['HOSTED_IMAGES_LOCAL_DIR']
    allowed_extensions = settings['ALLOWED_EXTENSIONS']
    # split it in case someone gets tricky w/ us

    head, image_name = os.path.split(image_name)
    file_name, file_extension = os.path.splitext(image_name)

    # they wanted a bad extension
    if file_extension not in allowed_extensions:
    	if g.is_anonymous:
	    	infoStr = "Anonymous user tried to upload bad file extension {0}".format(image_name)
	    else:
	    	infoStr = "User {0} tried to upload bad file extension {1}".format(g.user.id, image_name)
    	current_app.infoStr( infoStr )
    	return UploadedImage( False, '' )

    sanity_check = 0
    max_sanity_check = 10

    bad_name = True
    while( bad_name and sanity_check < max_sanity_check ):
    	# check it doesn't exist locally
    	# check it doesn't exist in the cloud