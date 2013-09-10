# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from datetime import datetime
from mongoengine import signals

from ..extensions import db
from ..helpers.mixin import EntityMixin, encode_model
from ..helpers.mongotools import db_list_to_dict_list
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
    image_url = db.StringField()

    social_object = db.EmbeddedDocumentField(SocialMediaObject)

    public = db.BooleanField(default=True)

    # Allow responses.  This is a dynamic structure but for now
    # we are only allowing responses to one individual parent document.
    responses = db.ListField(db.ReferenceField('self'), default=[])

    # having a populated parent field tells us this is a response.
    # we use a string of db id to avoid any infinite recursions,
    # despite this being slightly non-ideal.  It's more for reference anyway
    parent_id = db.StringField()

    meta = {
        'indexes': [
            {'fields': ['project'], 'unique': False },
            {'fields': ['project', 'parent_id'], 'unique': False },
            {'fields': ['project', 'public'], 'unique': False },
        ],
    }

signals.pre_save.connect(ProjectPost.pre_save, sender=ProjectPost)
"""
The presave routine filles in timestamps for us
"""
