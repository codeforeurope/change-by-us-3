# -*- coding: utf-8 -*-
"""
    Change By Us Models
    ~~~~~~~~~~~~~~~~~~~

    :copyright (c) 2011 Local Projects. All rights reserved.

"""
from datetime import datetime
from mongoengine import signals

from ..extensions import db
from ..helpers import swap_null_id
from ..models_common import EntityMixin
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

class Municipality(db.Document):
    """
    Municipality will eventually be turned into an object that represents 
    a location in a geo-database.  This will help us normalize location
    information and eventually search given a region, or coordinate and distance, etc
    """
    city = db.StringField(max_length=20)
    state = db.StringField(max_length=20)
    zipcode = db.StringField(max_length=20)
    # service unique identifier
    geo_identifier = db.StringField(max_length=100)

    def as_dict(self):
        return swap_null_id( self._data)


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

    
class Project(db.Document, EntityMixin):
    """
    Project model.  Pretty straight forward.  For image_uri we
    store the uri (/images/image.jpg) so that we can move data between
    servers and domains pretty easily
    """
    name = db.StringField(max_length=100, required=True, unique=True)
    description = db.StringField(max_length=600)
    municipality = db.StringField(max_length=5)
    image_uri = db.StringField()
    #municipality = db.ReferenceField(Municipality)
    owner = db.ReferenceField(User)

    stripe_account = db.ReferenceField(StripeAccount)
    retired_stripe_accounts = db.ListField()

    def as_dict(self):

        image_uris = gen_image_uris(self.image_uri)

        return {'id': str(self.id),
                'name': self.name,
                'description': self.description,
                'municipality': self.municipality,
                'created_at': self.created_at.isoformat(),
                # this is a little hacky
                'image_uri': image_uris.uri,
                'image_uri_large': image_uris.large_uri,
                'image_uri_medium': image_uris.medium_uri,
                'image_uri_small': image_uris.small_uri,
                'owner': self.owner.as_dict(),
                'owner_id': self.owner.id,
                'stripe_account': self.stripe_account.as_dict() if self.stripe_account else None }


class UserProjectLink(db.Document, EntityMixin):
    """
    UserProjectLink model.  This lets us keep track of what projects
    users are in.  An alternative approach could have been to have a ListField
    in the Project model, but the problem is that it would limit the number
    of users we could have in a project due to record size
    """
    user = db.ReferenceField(User)
    project = db.ReferenceField(Project)
    user_left = db.BooleanField(default = False)

    def as_dict(self):
        return swap_null_id(self._data)




signals.pre_save.connect(Project.pre_save, sender=Project)
signals.pre_save.connect(UserProjectLink.pre_save, sender=UserProjectLink)
"""
The presave routine filles in timestamps for us
"""
