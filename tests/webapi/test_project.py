# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from __future__ import with_statement
import datetime
import flask

from nose.tools import ( assert_equal as _assert_equal, 
                         assert_true as _assert_true, 
                         assert_false as _assert_false, 
                         with_setup )

from tests import BaseTestCase

import simplejson as json

from tests import (string_generator, email_generator, password_generator,
                   timestamp_generator, name_generator, text_generator,
                   unicode_generator, unicode_email_generator, zipcode_generator,
                   url_generator, gcal_code_generator, project_category_generator)

from classes.userClass import *
from classes.projectClass import *


class ProjectTests(BaseTestCase):

    def setUp(self):
        self.owner = UserClass()
        self.member = UserClass()
        self.project = ProjectClass()
        self.resource = ProjectClass()

    def test_projects(self):

        self.owner.createUser(self)
        self.project.createProject(self)

        # test the slug
        slug = self.GET('/api/project/slug/{0}'.format(self.project.data['slug']))
        self.assertTrue( slug['data']['slug'] == self.project.data['slug'] )

        #### edit the project
        self.project.name = name_generator()
        self.project.edit(self)

        # re-test the slug

        resp = self.GET('/logout')

        #### now join as diff user
        self.member.createUser(self) 
        self.member.joinProject(self, self.project.project_id)
        self.project.edit(self, expected = False)
        self.GET('/logout')

        #### login as owner
        self.owner.login(self)

        #### make our member an organizer
        self.project.changeRoll( self,
                                 self.project.project_id,
                                 self.member.user_id,
                                 'ORGANIZER' )

        #### log back in as the member/organizer
        self.GET('/logout')
        self.member.login(self)

        #### change project name
        # TODO can't this just be project.edit
        self.project.name = name_generator()
        self.project.edit( self, expected = True )

        #### now try to create a resource
        self.GET('/logout')
        self.owner.login(self)
        self.resource.createResource(self)
        self.GET('/logout')

        self.member.login(self)
        self.member.followResource(self, self.resource.project_id)
