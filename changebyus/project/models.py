# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from datetime import datetime
from mongoengine import signals

from ..extensions import db
from ..helpers.mongotools import swap_null_id
from ..helpers.mixin import EntityMixin
from ..user.models import User
from ..stripe.models import StripeAccount

from flask import current_app

import os
from collections import namedtuple


"""
===================
Project Model File
===================

This is a mongoDB models file that contains models for Projects.
For the most part it is pretty straight forward.  

"""


# TODO this should not be here, we need a cleaner solution to this
def gen_image_uris(image_uri):
    """
    Helper that will take a root image uri and create a named touple
    of image uri's based on various sizes.  Note that these various
    sizes will need to be synced with the sizes in templates and in
    helpers.py: generate_thumbnails
    """

    Thumbnails = namedtuple('Thumbnails', 'uri large_uri medium_uri small_uri')

    root_image = image_uri if image_uri is not None else current_app.settings['DEFAULT_PROJECT_IMAGE']

    path, image = os.path.split(root_image)
    large_uri = os.path.join(path, '1020.320.' + image)
    medium_uri = os.path.join(path, '300.94.' + image)
    small_uri = os.path.join(path, '160.50.' + image)

    images = Thumbnails(root_image, large_uri, medium_uri, small_uri)

    return images


# Python 3 allows ENUM's, eventually move to that
class Roles:
    ORGANIZER = "ORGANIZER"
    MEMBER = "MEMBER"
    
class Role(db.EmbeddedDocument):
    """
    This allows us to define project roles, such as "Organizer"
    """
    user = db.ReferenceField(User)
    name = db.StringField(max_length=80, unique=True)
    description = db.StringField(max_length=255)


class Project(db.Document, EntityMixin):
    """
    Project model.  Pretty straight forward.  For image_uri we
    store the uri (/images/image.jpg) so that we can move data between
    servers and domains pretty easily
    """
    name = db.StringField(max_length=100, required=True, unique=True)
    description = db.StringField(max_length=600)

    image_uri = db.StringField() # TODO change this
    #municipality = db.ReferenceField(Municipality)
    owner = db.ReferenceField(User)

    stripe_account = db.ReferenceField(StripeAccount)
    retired_stripe_accounts = db.ListField()

    # list of members and organizers etc.
    # we map a User to a Role
    # TODO fix this mofo
    user_roles = db.DictField()  #db.ListField(db.embeddedDocument(Role))

    # Geo JSON Field
    geo_location = db.PointField()

    def as_dict(self, exclude_nulls=True, recursive=False, depth=1, **kwargs ):
        resp = encode_model(exclude_nulls, recursive, depth, **kwargs)

        image_uris = gen_image_uris(self.image_uri)

        # TODO cloudify this
        resp['image_uri_large'] = image_uris.large_uri
        resp['image_uri_medium'] = image_uris.medium_uri
        resp['image_uri_small'] = image_uris.small_uri

        return resp


'''
class UserProjectLink(db.Document, EntityMixin):
    """
    UserProjectLink model.  This lets us keep track of what projects
    users are in.  An alternative approach could have been to have a ListField
    in the Project model, but the problem is that it would limit the number
    of users we could have in a project due to record size
    """
    user = db.ReferenceField(User)
    project = db.ReferenceField(Project)
    role = db.ListField(db.ReferenceField(Role), default=[])

    def as_dict(self):
        return swap_null_id(self._data)
'''

signals.pre_save.connect(Project.pre_save, sender=Project)
"""
The presave routine filles in timestamps for us
"""
