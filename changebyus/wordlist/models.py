# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from ..extensions import db
from ..helpers.mixin import EntityMixin, encode_model
from flask import current_app
from mongoengine import signals

class WordList(db.Document, EntityMixin):
    keyname = db.StringField(max_length = 100, required = True, unique = True)
    words = db.ListField(db.StringField)
    
signals.pre_save.connect(WordList.pre_save, sender=WordList)