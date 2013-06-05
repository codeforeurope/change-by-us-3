# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from datetime import datetime
from mongoengine import signals

from ..extensions import db
from ..helpers import swap_null_id
from ..models_common import EntityMixin
from ..project.models import Project
from ..user.models import User

"""
================
Posts Model File
================

This is a MongoDB models file that contains models for Posts.
For the most part it should be pretty straight forward.  The max_length
of fields are chosen rather arbitrarily, so they can be adjusted as needed,
but keep in mind screen formatting considerations.

All models have a as_dict routine that helps us format and hide data
when appropriate.
"""

class SocialMediaObject(db.EmbeddedDocument):
    """
    ABOUT
        This helps us track if the post was coppied to a social
        platform such as Twitter or Facebook by storing the appropriate ID.
        The actual posting occurs in external modules
    """
    facebook_id = db.StringField(max_length=100)
    twitter_id = db.StringField(max_length=100)

    def as_dict(self):
        return swap_null_id(self._data)


class Address(db.EmbeddedDocument):
    """
    ABOUT
        This is a temporary store mainly used for one time events.
        When we say temporary we mean it's not going to be standardized
        to a zipcode or postal address, it's just for users to view for a 
        specific address such as "The park on spring street".
    """
    name = db.StringField(max_length=50)
    address = db.StringField(max_length=50)
    neighborhood = db.StringField(max_length=50)
    city = db.StringField(max_length=20)
    state = db.StringField(max_length=20)
    zipcode = db.StringField(max_length=10)

    def as_dict(self):
        return swap_null_id(self._data)


class Event(db.EmbeddedDocument):
    """
    ABOUT
        Stores information on a one time event related to a post.  Ie I post
        about a cleanup event that is going to occur at a local park
    TODO
        Properly integrate the Address model into this rather than just storing
        the location string
    """
    event_type = db.StringField(max_length=10)  # 
    address = db.StringField(max_length=100)
    #address = db.EmbeddedDocument(Address)
    occurs_at = db.DateTimeField()

    def as_dict(self):
        return swap_null_id(self._data)


class ProjectPost(db.Document, EntityMixin):
    """
    ABOUT
        This is the core model of this Blueprint.  These are posts for a given project.
        The name ProjectPost shows how this module is posssibly over-dependent on the
        Project blueprint.
    TODO
        Evaluate the dependency on the Project model and perhaps restructure to make
        this blueprint more flexible.
    """
    project = db.ReferenceField(Project)
    user = db.ReferenceField(User)

    title = db.StringField(max_length=60) 
    description = db.StringField(max_length=600)
    image_uri = db.StringField()

    social_object = db.EmbeddedDocumentField(SocialMediaObject)
    event = db.EmbeddedDocumentField(Event)

    public = db.BooleanField(default=True)
    
    def as_dict(self):
        return {'id': str(self.id),
                'title': self.title,
                'description': self.description,
                'image_uri': self.image_uri,
                'created_at': self.created_at.isoformat(),
                'project_name': self.project.name,
                'project_id': str(self.project.id),
                # TODO migrate this way from project_name, project_id, etc
                # and all towards post.project...
                'project': self.project.as_dict(),
                'user_display_name' : self.user.display_name,
                'public' : self.public,
                 }


signals.pre_save.connect(ProjectPost.pre_save, sender=ProjectPost)
"""
The presave routine filles in timestamps for us
"""
