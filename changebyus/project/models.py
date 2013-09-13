# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from datetime import datetime
from mongoengine import signals

from ..extensions import db
from ..user.models import User
from ..stripe.models import StripeAccount
from ..helpers.imagetools import ( ImageManipulator, generate_thumbnail, 
                                   generate_ellipse_png )

from ..helpers.stringtools import slugify

from ..helpers.mixin import ( handle_decryption, handle_initial_encryption,
                              handle_update_encryption, EntityMixin, encode_model )


from flask import current_app
from flask.ext.cdn import url_for

import os
from collections import namedtuple


"""
===================
Project Model File
===================

This is a mongoDB models file that contains models for Projects.
For the most part it is pretty straight forward.  

"""


project_images = [ 
    
    ImageManipulator(dict_name = "image_url_large_rect",
                     converter = lambda x: generate_thumbnail(x, [1020, 430]),
                     prefix = "1020.430",
                     extension = ".jpg"),

    ImageManipulator(dict_name = "image_url_medium_rect",
                     converter = lambda x: generate_thumbnail(x, [1020, 170]),
                     prefix = "1020.170",
                     extension = ".jpg"),

    ImageManipulator(dict_name = "image_url_small_square",
                     converter = lambda x: generate_thumbnail(x, [300, 300]),
                     prefix = "300.300",
                     extension = ".jpg"),

    ImageManipulator(dict_name = "image_url_round",
                     converter = lambda x: generate_ellipse_png(x, [250, 250]),
                     prefix = "250.250",
                     extension = ".png"),

]


# TODO this should not be here, we need a cleaner solution to this
def gen_image_urls(image_url):

    """
    Helper that will take a root image name, and given our image manipulators
    assign names
    """

    images = {}

    root_image = image_url if image_url is not None else current_app.settings['DEFAULT_PROJECT_IMAGE']

    for manipulator in project_images:
        base, extension = os.path.splitext(root_image)
        name = manipulator.prefix + "." + base + manipulator.extension
        images [ manipulator.dict_name ] = url_for( 'static', filename = name )

    return images



# Python 3 allows ENUM's, eventually move to that
class Roles:
    ORGANIZER = "ORGANIZER"
    MEMBER = "MEMBER"

ACTIVE_ROLES = [Roles.ORGANIZER, Roles.MEMBER]


class Project(db.Document, EntityMixin):
    """
    Project model.  Pretty straight forward.  For image_url we
    store the url (/images/image.jpg) so that we can move data between
    servers and domains pretty easily
    """
    name = db.StringField(max_length=100, required=True, unique=True)
    description = db.StringField(max_length=600)

    image_name = db.StringField()
    #municipality = db.ReferenceField(Municipality)
    owner = db.ReferenceField(User)

    stripe_account = db.ReferenceField(StripeAccount)
    retired_stripe_accounts = db.ListField()

    # Geo JSON Field
    geo_location = db.PointField()

    # NOTE: This is very CBU specific
    # a project is either a project or a resource
    # resource is different on the UI side and does slightly less
    resource = db.BooleanField(default=False)

    slug = db.StringField(unique=True)


    meta = {
        'indexes': [
            {'fields': ['name'], 'unique': True },
            {'fields': ['slug'], 'unique': True },
            {'fields': ['name', 'slug'], 'unique': True },
        ],
    }


    PRIVATE_FIELDS = [
    'retired_stripe_accounts',
    ]

    ENCRYPTED_FIELDS = []


    @classmethod    
    def pre_save(cls, sender, document, **kwargs):
        EntityMixin.pre_save(sender, document)
        
        if document.is_new():
            # ensure it's properly slugged
            slug = slugify( document.name )
        elif document.__dict__.has_key('_changed_fields'):
            slug = slugify( document.name )



    @classmethod    
    def post_init(cls, sender, document, **kwargs):
        handle_decryption(document, document.ENCRYPTED_FIELDS)

    def as_dict(self, exclude_nulls=True, recursive=False, depth=1, **kwargs ):
        resp = encode_model(self, exclude_nulls, recursive, depth, **kwargs)

        image_urls = gen_image_urls(self.image_name)

        for image, url in image_urls.iteritems():
            resp[image] = url

        return resp


class UserProjectLink(db.Document, EntityMixin):
    """
    UserProjectLink model.  This lets us keep track of what projects
    users are in.  An alternative approach could have been to have a ListField
    in the Project model, but the problem is that it would limit the number
    of users we could have in a project due to record size
    """
    user = db.ReferenceField(User)
    project = db.ReferenceField(Project)
    role = db.StringField()

    meta = {
        'indexes': [
            {'fields': ['user'], 'unique': False },
            {'fields': ['project'], 'unique': False },
            {'fields': ['user', 'project'], 'unique': True },
        ],
    }


signals.post_init.connect(Project.post_init, sender=Project)
signals.pre_save.connect(Project.pre_save, sender=Project)

signals.pre_save.connect(UserProjectLink.pre_save, sender=UserProjectLink)
"""
The presave routine filles in timestamps for us
"""
