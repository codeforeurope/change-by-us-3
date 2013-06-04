# -*- coding: utf-8 -*-
from datetime import datetime

from .extensions import db


"""
====================
Common Model Objects
====================

Timestamps to be mixed in with a MongoDB object, and the pre_save
routine that will populate them

"""


class EntityMixin(object):
    created_at = db.DateTimeField()
    updated_at = db.DateTimeField()
    
    def is_new(self):
        return True if self.id is None else False
    
    @classmethod    
    def pre_save(cls, sender, document, **kwargs):
        if not document.created_at:
            document.created_at = datetime.utcnow()
        document.updated_at = datetime.utcnow() 