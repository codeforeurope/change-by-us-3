# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

import os
import random
import shutil
import inspect
import yaml
import pyrax
import string

from PIL import Image

from collections import namedtuple
from flask import current_app, g, Blueprint
from werkzeug import secure_filename, FileStorage

root_directory = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
settings = yaml.load(file(root_directory + '/config/rackspace.yml'))


def _get_rackspace_container():

    pyrax.set_setting("identity_type", "rackspace")
    pyrax.set_credentials(settings['RACKSPACE_USERNAME'], settings['RACKSPACE_KEY'])

    cf = pyrax.cloudfiles
    container = cf.create_container( settings['RACKSPACE_CONTAINER'] )

    return container

container = _get_rackspace_container()


def string_generator(size=6, chars=string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for x in range(size))


def lowercase_ext(filename):
    if '.' in filename:
        main, ext = filename.rsplit('.', 1)
        return main + '.' + ext.lower()
    else:
        return filename.lower()


def _does_rackspace_file_exist(file_name):

    try:
        file_object = container.get_object( file_name )
        return True

    except pyrax.exceptions.NoSuchObject as e:
        return False



# simple return type
UploadedImage = namedtuple('UploadedImage', 'success path name uri')


def _upload_image( resource, resource_name = None):

    """
    unfortunately the following needs to happen

    - test that it's an allowed extension
    - test to see if the file name is OK locally
    - test to see if the file name is OK remotely
    - generate file names
    """

    base_path = settings['HOSTED_IMAGES_LOCAL_DIR']
    allowed_extensions = settings['ALLOWED_EXTENSIONS']

    if not (    isinstance(resource, FileStorage) 
             or isinstance(resource, str)
             or isinstance(resource, Image) ):

        raise TypeError("resouece must be a werkzeug.FileStorage or string or Image")


    if isinstance( resource, str ):
        filename = resource
    elif isinstance( resource, FileStorage ):
        filename = resource.filename
    elif isinstance( resource, Image ):
        filename = resource_name
    else:
        raise TypeError("resouece must be a werkzeug.FileStorage or string or Image")


    basename = lowercase_ext(secure_filename( filename ))

    print "found basename of uploaded file to be ", basename

    # split it into parts
    file_base_name, file_extension = os.path.splitext(basename)

    # they wanted a bad extension
    if file_extension not in allowed_extensions:
        if g.is_anonymous:
            infoStr = "Anonymous user tried to upload bad file extension {0}".format( local_file )
        else:
            infoStr = "User {0} tried to upload bad file extension {1}".format( g.user.id, local_file )
        current_app.infoStr( infoStr )
        return UploadedImage( False, '', '' )


    # if we got this far let's make sure the name is not taken
    sanity_check = 0
    max_sanity_check = 20

    new_file = file_name
    full_file_path = os.path.join( base_path, new_file )

    print "isfile {0} {1}".format(full_file_path, os.path.isfile( full_file_path ))
    print "rackspace {0} {1}".format(new_file, _does_rackspace_file_exist( new_file ))

    while (   

        ( os.path.isfile(full_file_path) 
          or _does_rackspace_file_exist(new_file) )

        and sanity_check < max_sanity_check  
    ):

        # check it doesn't exist locally
        # check it doesn't exist in the cloud

        print "isfile {0} {1}".format(full_file_path, os.path.isfile( full_file_path ))
        print "rackspace {0} {1}".format(new_file, _does_rackspace_file_exist( new_file ))

        new_file = "{0}.{1}.{2}{3}".format( file_base_name,
                                            sanity_check,
                                            string_generator(2),
                                            file_extension )

        full_file_path = os.path.join( base_path, new_file )

        sanity_check += 1

    if sanity_check >= max_sanity_check:
        user = "anonymous" if g.user.is_anonymous() else g.user.id
        errStr = "We reached a sanity check while trying to upload file {0} for user {1}".format(local_file, 
                                                                                                 user)
        current_app.logger.error(errStr)

        return UploadedImage( False, '', '', '' )

    # otherwise let's make both a local copy and a remote copy
    try:
        if isinstance( storage, str ):
            shutil.copy( storage, full_file_path )
        if isinstance( storage, FileStorage ):
            storage.save( full_file_path )
        if isinstance( storage, Image ):
            storage.save( full_file_path )
        else:
            raise TypeError("resouece must be a werkzeug.FileStorage or string or Image")

    except Exception as e:
        errStr = "Error trying to save local file to {0}".format( full_file_path )
        current_app.logger.error(errStr)
        current_app.logger.exception(e)

    try:

        # use the renaimed file
        container.upload_file( full_file_path )

    except Exception as e:
        errStr = "Error trying to upload file to rackspace system."
        current_app.logger.error(errStr)
        current_app.logger.exception(e)

        return UploadedImage( False, '', '', '' )


    uri = settings['HOSTED_IMAGE_BASE_URI'] + '/' + new_file
    return UploadedImage( True, full_file_path, new_file, uri )

    


