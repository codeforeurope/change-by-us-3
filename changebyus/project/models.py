# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from changebyus.extensions import db
from changebyus.helpers.crypt import handle_decryption
from changebyus.helpers.imagetools import (ImageManipulator, generate_thumbnail, 
    generate_ellipse_png)
from changebyus.helpers.mixin import (EntityMixin, HasActiveEntityMixin, FlaggableEntityMixin, 
                                      LocationEnabledEntityMixin)
from changebyus.helpers.stringtools import slugify
from changebyus.stripe.models import StripeAccount
from changebyus.user.models import User
from flask import current_app as app
from flask.ext.cdn import url_for
from flask_mongoutils import object_to_dict
from mongoengine import signals

import os
# from ..helpers.mixin import (handle_decryption, handle_initial_encryption, 
#     handle_update_encryption, EntityMixin, encode_model)



"""
.. module: project/models

    :synopsis: The project model file

"""


"""
    List of image manipulators that will be used to generate image
    files out of a project thumbnail image
"""
project_images = [ 
    
    ImageManipulator(dict_name = "image_url_large_rect",
                     converter = lambda x: generate_thumbnail(x, 
                                                             [1020, 430], 
                                                             blurs=8,
                                                             brightness=0.8),
                     prefix = "1020.430",
                     extension = ".jpg"),

    ImageManipulator(dict_name = "image_url_medium_rect",
                     converter = lambda x: generate_thumbnail(x, 
                                                             [1020, 170], 
                                                             blurs=8,
                                                             brightness=0.8),
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
        and preferred remote storage container will generate image names and urls.

        Example: happycat.jpg will have the imges 
        250.250.happycat.png
        300.300.happycat.jpg
        etc

        Args:
            Base image name
        Returns:
            a dict of multiple {image_name : image_url}
    """

    images = {}

    root_image = image_url if image_url is not None else app.settings['DEFAULT_PROJECT_IMAGE']

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


class Project(db.Document, EntityMixin, HasActiveEntityMixin, FlaggableEntityMixin, 
              LocationEnabledEntityMixin):
    """
    Project model.  Pretty straight forward.  For image_url we
    store the url (/images/image.jpg) so that we can move data between
    servers and domains pretty easily
    """
    name = db.StringField(max_length=100, required=True, unique=True)
    email = db.StringField(max_length=100)
    description = db.StringField(max_length=600)
    website = db.StringField(max_length=200)

    category = db.StringField()
    gcal_code = db.StringField(max_length=500)

    image_name = db.StringField()
    #municipality = db.ReferenceField(Municipality)
    owner = db.ReferenceField(User)

    stripe_account = db.ReferenceField(StripeAccount)
    retired_stripe_accounts = db.ListField()

    # NOTE: This is very CBU specific
    # a project is either a project or a resource
    # resource is different on the UI side and does slightly less
    resource = db.BooleanField(default=False)
    approved = db.BooleanField(default=True)

    slug = db.StringField(unique=True)
    
    activity = db.DecimalField()

    private = db.BooleanField(default=False)

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
        resp = object_to_dict(self, app=app, 
                      exclude_nulls=exclude_nulls, 
                      recursive=recursive, 
                      depth=depth, 
                      **kwargs)
                              
        image_urls = gen_image_urls(self.image_name)

        for image, url in image_urls.iteritems():
            resp[image] = url

        return resp
        
    @classmethod
    def with_id_or_slug(cls, object_id):
        """
        Allows query by id or slug 
        """
        from bson.objectid import ObjectId
        
        if (ObjectId.is_valid(object_id)):
            return cls.objects.with_id(object_id)
        else:
            return cls.objects(slug=object_id).first()

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


class ProjectCategory(db.Document, HasActiveEntityMixin):
    """
    A simple list of categories.  NOT to be implemented in the project model
    as a reference.  This model is strictly for bookkeeping.
    """
    name = db.StringField(required=True, unique=True)
    

class ProjectCity(db.Document, EntityMixin, HasActiveEntityMixin, LocationEnabledEntityMixin):
    """
    Model for cities that have city pages.
    """
    name = db.StringField(required=True, unique=True)
    slug = db.StringField(unique=True)
    quote = db.StringField()
    image_name = db.StringField()
    website = db.StringField()
	
    def as_dict(self, exclude_nulls=True, recursive=False, depth=1, **kwargs ):
        resp = object_to_dict(self, app=app, 
                      exclude_nulls=exclude_nulls, 
                      recursive=recursive, 
                      depth=depth, 
                      **kwargs)
                              
        image_urls = gen_image_urls(self.image_name)

        for image, url in image_urls.iteritems():
            resp[image] = url

        return resp


signals.post_init.connect(Project.post_init, sender=Project)
signals.pre_save.connect(Project.pre_save, sender=Project)

signals.pre_save.connect(ProjectCity.pre_save, sender=ProjectCity)

signals.pre_save.connect(UserProjectLink.pre_save, sender=UserProjectLink)
"""
The presave routine filles in timestamps for us
"""
