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
from classes.postClass import *

class PostTests(BaseTestCase):

    def setUp(self):
        self.owner = UserClass()
        self.member = UserClass()
        self.responder = UserClass()

        self.project = ProjectClass()
       
        self.owner_post = PostClass()
        self.member_post = PostClass()
        self.response_post = PostClass()

    def test_posts(self):
        self.owner.createUser(self)
        self.project.createProject(self)
        self.owner_post.createDiscussion(self, self.project.project_id)
        self.owner_post.createUpdate(self, self.project.project_id)

        # make sure user doesn't have permissions to update or post
        self.GET('/logout')
        self.member.createUser(self)
        self.member_post.createUpdate(self, 
                                      self.project.project_id,
                                      expected = False)
        self.member_post.createDiscussion(self,
                                          self.project.project_id,
                                          expected = False)

        self.member.joinProject( self, 
                                 self.project.project_id)

        # now make user a member of the project
        self.GET('/logout')
        self.owner.login(self)
        self.project.changeRoll( self,
                                 self.project.project_id,
                                 self.member.user_id,
                                 'MEMBER' )
        self.GET('/logout')
        self.member.login(self)

        self.member_post.createUpdate(self, 
                                      self.project.project_id,
                                      expected = False)
        self.member_post.createDiscussion(self,
                                          self.project.project_id,
                                          expected = False)
        self.GET('/logout')

        # now make the member an organizer and try
        self.owner.login(self)
        self.project.changeRoll( self,
                                 self.project.project_id,
                                 self.member.user_id,
                                 'ORGANIZER' )

        self.GET('/logout')
        self.member.login(self)

        self.member_post.createUpdate(self, 
                                      self.project.project_id,
                                      expected = True)
        self.member_post.createDiscussion(self,
                                          self.project.project_id,
                                          expected = True)
        self.GET('/logout')

        # now work on responses
        self.responder.createUser( self )

        # try posting as non-member
        self.response_post.createUpdate( self,
                                         self.project.project_id,
                                         response_to = self.owner_post.update_id,
                                         expected = False )

        self.response_post.createDiscussion( self,
                                             self.project.project_id,
                                             response_to = self.owner_post.discussion_id,
                                             expected = False )


        # now join project
        self.responder.joinProject( self, self.project.project_id )

        # and retry the posts
        self.response_post.createUpdate( self,
                                         self.project.project_id,
                                         response_to = self.owner_post.update_id )

        self.response_post.createDiscussion( self,
                                             self.project.project_id,
                                             response_to = self.owner_post.discussion_id,
                                             expected = False )

        # now be sure we get the data formatted as we like it

        updates_url = '/api/post/project/{0}/updates'.format(self.project.project_id)
        updates = self.GET( updates_url )
        self.assertTrue( updates['success'] )

        success = False
        for update in updates['data']:
            if update['id'] == self.response_post.update_id:
                success = False
                print "Found the response at top level, failing."
                break
            if update['id'] == self.owner_post.update_id:
                if update['responses'][0]['id'] == self.response_post.update_id:
                    success = True

        self.assertTrue( success )

      
        discussions_url = '/api/post/project/{0}/discussions'.format(self.project.project_id)
        discussions = self.GET( discussions_url )
        self.assertTrue( updates['success'] )

        self.assertTrue( success )

