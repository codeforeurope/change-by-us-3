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



class LoginClass():

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
        self.user = LoginClass()
    
    def test_login_update(self):
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


class ProjectClass(BaseTestCase):

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


class ProjectTests(BaseTestCase):

    def setUp(self):
        self.owner = LoginClass()
        self.member = LoginClass()
        self.project = ProjectClass()

    def test_projects(self):

        self.owner.createUser(self)
        self.project.createProject(self)

        resp = self.GET( '/api/project/{0}'.format(self.project.project_id) )
        self.assertTrue( resp['data']['description'] == self.project.description )

        # edit the project
        self.project.name = name_generator()

        edit = { 'project_id' : self.project.project_id,
                 'name' : self.project.name }

        resp = self.POST('/api/project/edit', data = edit)
        self.assertTrue( resp['success'] )
        self.assertTrue( resp['data']['name'] == self.project.name )

        resp = self.GET('/logout')
        self.assertTrue( resp['success'] )

        # now join as diff user
        self.member.createUser(self) 

        join = { 'project_id' : self.project.project_id }
        resp = self.POST('/api/project/join', data = join)
        self.assertTrue( resp['success'] )

        resp = self.GET( '/api/project/user/{0}/joinedprojects'.format(self.member.user_id) )
        self.assertTrue( self.project.project_id == resp['data'][0]['id'] )

        edit = { 'project_id' : self.project.project_id,
                 'name' : 'bad name' }

        resp = self.POST('/api/project/edit', data = edit)
        self.assertFalse( resp['success'] )

        # login as owner
        self.GET('/logout')
        self.owner.login(self)

        # make our member an organizer
        role = { 'project_id' : self.project.project_id,
                 'user_id' : self.member.user_id,
                 'user_role' : 'ORGANIZER' }
        resp = self.POST('/api/project/change_user_role', data = role)
        self.assertTrue( resp['success'] )

        # log back in as the member/organizer
        self.GET('/logout')
        self.member.login(self)

        # change project name
        self.project.name = name_generator()
        edit = { 'project_id' : self.project.project_id,
                 'name' : self.project.name }

        resp = self.POST('/api/project/edit', data = edit)
        self.assertTrue( resp['success'] )





        