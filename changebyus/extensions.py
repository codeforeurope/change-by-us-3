# -*- coding: utf-8 -*-
"""
=================
Extensions File
=================

Allows an easy overview of what extensiosn we chose for 
each project
"""

from flask.ext.login import LoginManager
login_manager = LoginManager()

from flask.ext.mongoengine import MongoEngine
db = MongoEngine()