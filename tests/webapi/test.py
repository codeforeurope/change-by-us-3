# -*- coding: utf-8 -*-
"""
    NS11MM Test Template
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    Template to start new test cases from

    :copyright: (c) 2012 Local Projects
    :license:
"""
from __future__ import with_statement
import datetime
import flask

from nose.tools import assert_equal, assert_true, assert_false, with_setup

from tests import BaseTestCase

from tests import (string_generator, email_generator, password_generator,
                   timestamp_generator, name_generator, text_generator,
                   unicode_generator, unicode_email_generator)



class UserClass():

    def __init__(self):

        self.email = email_generator()
        self.pw = password_generator()
        self.name = name_generator()
        self.fname = self.name
        self.lname = self.name
        self.dname = self.name

    def s(self, field, val):
        self.vars[field] = val

    def g(self, field):
        return self.vars[field]

    def createUser(self, client):
        create = {'email' : self.email,
                  'password' : self.pw,
                  'display_name' : self.dname,
                  'first_name' : self.fname,
                  'last_name' : self.lname}

        resp = client.POST('/api/user/create', data = create)
        client.assertTrue( resp['success'] )
        self.user_id = resp['data']['id']


    def login(self, client):
        login = {'email' : self.email, 
                 'password' : self.pw}

        resp = client.POST('/login', data = login)
        client.assertTrue( resp['success'] )

    def joinProject(self, client, project_id):

        join = { 'project_id' : project_id }
        resp = client.POST('/api/project/join', data = join)
        client.assertTrue( resp['success'] )

        resp = client.GET( '/api/project/user/{0}/joinedprojects'.format(self.user_id) )
        
        joined = False
        for project in resp['data']:
            if project['id'] == project_id:
                joined = True

        client.assertTrue( joined )


class UserTests(BaseTestCase):
    #
    # """Use the template below for new test cases"""
    # def dummy_test(self):
    #     """Template to start from"""
    #     response = self.client.get('/resource/to/call', environ_overrides={'REMOTE_ADDR': '127.0.0.1'})
    #     data = json.loads(response.data)
    #     self.assertTrue(data.get('code') == 200, str(data))
    #                  }
    #     response = self.client.post('/post/resource', data=json_data, 
    #                                 environ_overrides={'REMOTE_ADDR': '127.0.0.1'}, 
    #                                 content_type="application/json")
    #

    def setUp(self):
        self.user = UserClass()
    
    def test_login_update(self):
    #def login_update(self):
        self.user.createUser(self)
        self.GET('/logout')
        self.user.login(self)

        # change email permissions
        update = {'public_email': True}
        resp = self.POST('/api/user/edit', data = update)
        self.assertTrue( resp['success'] )
        self.assertTrue( resp['data']['email'] == self.user.email )

        update = {'public_email': False}
        resp = self.POST('/api/user/edit', data = update)
        self.assertTrue( resp['success'] )

        self.assertTrue( resp['data']['email'] == None)


class ProjectClass():

    def __init__(self):
        self.name = name_generator()
        self.description = text_generator(100)
        self.location = 11101

    def createProject(self, client):
        create = { 'name' : self.name,
                   'description' : self.description,
                   'location' : self.location }

        resp = client.POST('/api/project/create', data = create)
  
        client.assertTrue( resp['success'] )
        client.assertTrue( resp['data']['name'] == self.name )

        self.project_id = resp['data']['id']   

        resp = client.GET( '/api/project/{0}'.format(self.project_id) )
        client.assertTrue( resp['data']['description'] == self.description )

    def edit(self, client, expected = True):

        edit = { 'project_id' : self.project_id,
                 'name' : self.name,
                 'description' : self.description,
                 'location' : self.location }

        resp = client.POST('/api/project/edit', data = edit)

        if expected:
            client.assertTrue( resp['success'] )
            print resp
            client.assertTrue( resp['data']['name'] == self.name )
            client.assertTrue( resp['data']['description'] == self.description )
            # todo GEO stuff
            #client.assertTrue( resp['data']['location'] == self.location )
        else:
            client.assertFalse( resp['success'] )

    def changeRoll(self, client, project_id, user_id, roll):

        role = { 'project_id' : project_id,
                 'user_id' : user_id,
                 'user_role' : roll }

        resp = client.POST('/api/project/change_user_role', data = role)

        client.assertTrue( resp['success'] )

class ProjectTests(BaseTestCase):

    def setUp(self):
        self.owner = UserClass()
        self.member = UserClass()
        self.project = ProjectClass()

    def test_projects(self):
    #def projects(self):

        self.owner.createUser(self)
        self.project.createProject(self)

        #### edit the project
        self.project.name = name_generator()
        self.project.edit(self)
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
        self.project.name = name_generator()
        edit = { 'project_id' : self.project.project_id,
                 'name' : self.project.name }

        resp = self.POST('/api/project/edit', data = edit)
        self.assertTrue( resp['success'] )


class PostClass():

    def __init__(self):
       pass

    def prepareUpdate(self, project_id):
        self.update_title = name_generator()
        self.update_description = text_generator(100)
        self.update_project_id = project_id 

    def prepareDiscussion(self, project_id):
        self.discussion_title = name_generator()
        self.discussion_description = text_generator(100)
        self.discussion_project_id = project_id 

    def createUpdate(self, 
                     client, 
                     project_id, 
                     response_to=None,
                     expected=True):

        self.prepareUpdate(project_id)


        update = { 'title' : self.update_title,
                   'description' : self.update_description,
                   'project_id' : self.update_project_id }

        if response_to:
            update['response_to_id'] =  response_to

        resp = client.POST('/api/post/add_update', data = update)
        print resp
        if expected:
            client.assertTrue( resp['success'] )
            self.update_id = resp['data']['id']
        else:
            client.assertFalse( resp['success'] )


    def createDiscussion(self,
                         client, 
                         project_id, 
                         response_to=None,
                         expected=True):
        
        self.prepareDiscussion(project_id)

        update = { 'title' : self.discussion_title,
                   'description' : self.discussion_description,
                   'project_id' : self.discussion_project_id }

        if response_to:
            update['response_to_id'] = response_to

        resp = client.POST('/api/post/add_discussion', data = update)
        print resp
        if expected:
            client.assertTrue( resp['success'] )
            self.discussion_id = resp['data']['id']
        else:
            client.assertFalse( resp['success'] )



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
                                          expected = True)
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
                                             response_to = self.owner_post.discussion_id )


        # now be sure we get the data formatted as we like it


        print "\n\n\n\n\n\n********** DECODING **********\n\n\n"

        from pprint import pprint
        updates_url = '/api/post/project/{0}/list_updates'.format(self.project.project_id)
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

      
        discussions_url = '/api/post/project/{0}/list_discussions'.format(self.project.project_id)
        discussions = self.GET( discussions_url )
        self.assertTrue( updates['success'] )

        pprint(updates)

        success = False
        for update in discussions['data']:
            if update['id'] == self.response_post.discussion_id:
                success = False
                print "Found the response at top level, failing."
                break
            if update['id'] == self.owner_post.discussion_id:
                if update['responses'][0]['id'] == self.response_post.discussion_id:
                    success = True

        self.assertTrue( success )


        