# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from changebyus.extensions import db
from changebyus.helpers.mixin import EntityMixin
from mongoengine import signals

class WordList(db.Document, EntityMixin):
    keyname = db.StringField(max_length = 100, required = True, unique = True)
    words = db.ListField(db.StringField)
    
signals.pre_save.connect(WordList.pre_save, sender=WordList)