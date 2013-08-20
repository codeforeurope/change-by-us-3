# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

import os
import random
import shutil

from collections import namedtuple
from flask import current_app, g


def _get_rackspace_container():
	root_directory = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
	settings = yaml.load(file(root_directory + '/config/rackspace.yml'))


	pyrax.set_setting("identity_type", "rackspace")
	pyrax.set_credentials(settings['RACKSPACE_USERNAME'], settings['RACKSPACE_KEY'])

	cf = pyrax.cloudfiles
	container = cf.get_container( settings['RACKSPACE_CONTAINER'] )

	return container

container = _get_rackspace_container()


def string_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for x in range(size))

def _does_rackspace_file_exist(file_name):

    try:
	    file_object = cf.get_object( file_name )
	    return True

	except pyrax.exceptions.NoSuchObject as e:
		return False


def _upload_image(local_image):
	pass

	"""
	unfortunately the following needs to happen

	- test that it's an allowed extension
	- test to see if the file name is OK locally
	- test to see if the file name is OK remotely
	- generate file names
	"""

	# simple return type
    UploadedImage = namedtuple('UploadedImage', 'success name')


    base_path = settings['HOSTED_IMAGES_LOCAL_DIR']
    allowed_extensions = settings['ALLOWED_EXTENSIONS']
    # split it in case someone gets tricky w/ us

    file_path, file_name = os.path.split(local_image)
    file_base_name, file_extension = os.path.splitext(file_name)

    # they wanted a bad extension
    if file_extension not in allowed_extensions:
    	if g.is_anonymous:
	    	infoStr = "Anonymous user tried to upload bad file extension {0}".format(local_image)
	    else:
	    	infoStr = "User {0} tried to upload bad file extension {1}".format(g.user.id, local_image)
    	current_app.infoStr( infoStr )
    	return UploadedImage( False, '' )

    sanity_check = 0
    max_sanity_check = 20



    new_file = file_name
    full_file_path = os.path.join( base_path, new_file )

    while ( not os.path.isfile( full_file_path ) 
    		and _does_rackspace_file_exist( new_file )
    		and sanity_check < max_sanity_check 
    										 	):
    	# check it doesn't exist locally
    	# check it doesn't exist in the cloud

    	new_file = "{0}{1}{2}{3}{4}".format( file_base_name,
    			 		  				     ".",
    										 sanity_check,
    										 string_generator(2),
    										 file_extension )

    	full_file_path = os.path.join( base_path, new_file )

    	sanity_check += 1

    if sanity_check >= max_sanity_check:
    	user = "anonymous" if g.user.is_anonymous() else g.user.id
    	errStr = "We reached a sanity check while trying to upload file {0} for user {1}".format(local_image, 
    																						     user)
    	current_app.logger.error(errStr)

    	return UploadedImage( False, '' )

    # otherwise let's make both a local copy and a remote copy
    try:
	    shutil.copyfile( local_file, full_file_path )
	except Exception as e:
		# TODO log it

		return UploadedImage( False, '' )

	try:

	except Exception as e:
		# TODO log it

		return UploadedImage( False, '' )


    cp local_file to full_file_path
    upload image as new_file




