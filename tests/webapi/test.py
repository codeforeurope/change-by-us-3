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

from nose.tools import ( assert_equal as _assert_equal, 
                         assert_true as _assert_true, 
                         assert_false as _assert_false, 
                         with_setup )

from tests import BaseTestCase

from tests import (string_generator, email_generator, password_generator,
                   timestamp_generator, name_generator, text_generator,
                   unicode_generator, unicode_email_generator, zipcode_generator)


class AssertClass(BaseTestCase):

  def assertTrueMsg(self, value, msg):
    try:
      self.assertTrue(value)

    except Exception as e:
      print "Exception msg: ", msg
      raise e

  def assertFalseMsg(self, value, msg):
    try:
      self.assertFalse(value)

    except Exception as e:
      print "Exception msg: ", msg
      raise e

  def assertEqualMsg(self, value, msg):
    try:
      self.assertEqual(value)

    except Exception as e:
      print "Exception msg: ", msg
      raise e


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
        client.assertTrueMsg( resp['success'], resp['msg'] )
        self.user_id = resp['data']['id']
        self.data = resp['data']


    def login(self, client):
        login = {'email' : self.email, 
                 'password' : self.pw}

        resp = client.POST('/login', data = login)
        client.assertTrueMsg( resp['success'], resp['msg'] )

    def joinProject(self, client, project_id):

        join = { 'project_id' : project_id }
        resp = client.POST('/api/project/join', data = join)
        client.assertTrueMsg( resp['success'], resp['msg'] )

        resp = client.GET( '/api/project/user/{0}/joinedprojects'.format(self.user_id) )
        
        joined = False
        for project in resp['data']:
            if project['id'] == project_id:
                joined = True

        client.assertTrue( joined )


class UserTests(AssertClass):

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
        self.assertTrueMsg( resp['success'], resp['msg'] )
        self.assertTrueMsg( resp['data']['email'] == self.user.email, resp['msg'] )

        update = {'public_email': False}
        resp = self.POST('/api/user/edit', data = update)
        self.assertTrueMsg( resp['success'], resp['msg'] )

        self.assertTrueMsg( resp['data']['email'] == None, resp['msg'])


class ProjectClass():

    def __init__(self):
        self.name = name_generator()
        self.description = text_generator(100)
        self.location = zipcode_generator()

    def createProject(self, client):
        create = { 'name' : self.name,
                   'description' : self.description,
                   'location' : self.location }

        resp = client.POST('/api/project/create', data = create)
  
        client.assertTrueMsg( resp['success'] , resp['msg'])
        client.assertTrueMsg( resp['data']['name'] == self.name, resp['msg'] )

        self.project_id = resp['data']['id']
        self.data = resp['data']

        resp = client.GET( '/api/project/{0}'.format(self.project_id) )
        client.assertTrueMsg( resp['data']['description'] == self.description, resp['msg'] )

    def edit(self, client, expected = True):

        edit = { 'project_id' : self.project_id,
                 'name' : self.name,
                 'description' : self.description,
                 'location' : self.location }

        resp = client.POST('/api/project/edit', data = edit)

        if expected:
            client.assertTrueMsg( resp['success'], resp['msg'] )
            print resp
            client.assertTrueMsg( resp['data']['name'] == self.name, resp['msg'] )
            client.assertTrueMsg( resp['data']['description'] == self.description, resp['msg'] )
            self.data = resp['data']
            # todo GEO stuff
            #client.assertTrueMsg( resp['data']['location'] == self.location, resp['msg'] )
        else:
            client.assertFalse( resp['success'], resp['msg'] )

    def changeRoll(self, client, project_id, user_id, roll):

        role = { 'project_id' : project_id,
                 'user_id' : user_id,
                 'user_role' : roll }

        resp = client.POST('/api/project/change_user_role', data = role)

        client.assertTrueMsg( resp['success'], resp['msg'] )

class ProjectTests(AssertClass):

    def setUp(self):
        self.owner = UserClass()
        self.member = UserClass()
        self.project = ProjectClass()

    def test_projects(self):

        self.owner.createUser(self)
        self.project.createProject(self)

        # test the slug
        slug = self.GET('/api/project/slug/{0}'.format(self.project.data['slug']))
        self.assertTrueMsg( slug['data']['slug'] == self.project.data['slug'], slug['msg'] )

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
            client.assertTrueMsg( resp['success'], resp['msg'] )
            self.update_id = resp['data']['id']
            self.data = resp['data']
        else:
            client.assertFalseMsg( resp['success'], resp['msg'] )



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
            client.assertTrueMsg( resp['success'], resp['msg'] )
            self.discussion_id = resp['data']['id']
            self.data = resp['data']
        else:
            client.assertFalseMsg( resp['success'], resp['msg'] )



class PostTests(AssertClass):

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


        print "\n\n\n\n\n\n********** DECODING **********\n\n\n"

        from pprint import pprint
        updates_url = '/api/post/project/{0}/list_updates'.format(self.project.project_id)
        updates = self.GET( updates_url )
        self.assertTrueMsg( updates['success'], updates['msg'] )

        success = False
        for update in updates['data']:
            if update['id'] == self.response_post.update_id:
                success = False
                print "Found the response at top level, failing."
                break
            if update['id'] == self.owner_post.update_id:
                if update['responses'][0]['id'] == self.response_post.update_id:
                    success = True

        self.assertTrueMsg( success, updates['msg'] )

      
        discussions_url = '/api/post/project/{0}/list_discussions'.format(self.project.project_id)
        discussions = self.GET( discussions_url )
        self.assertTrueMsg( updates['success'], updates['msg'] )

        pprint(updates)

        self.assertTrueMsg( success, updates['msg'] )

class SearchTest(BaseTestCase):
    """
    All tests currently assume projects created with project tests, 
    i.e. they have 'lorem' in the text and a location in NYC
    """
    search_string = "lorem"
    search_loc = "11217"
    search_dist = "10"
    url = "/api/project/search"

    def test_text_search(self):
        search_url = "{0}?s={1}".format(self.url, self.search_string)
        results = self.GET(search_url)
                
        self.assertTrue(len(results) > 0)

#   COMMENTED OUT pending writing a test for creating resources
#     def test_text_resource_search(self):
#         search_url = "{0}?s={1}&type=resource".format(self.url, self.search_string)
#         results = self.GET(search_url)
#                 
#         self.assertTrue(len(results) > 0)
        
    def test_geo_search(self):
        search_url = "{0}?loc={2}&d={3}".format(self.url, 
                                              self.search_string,
                                              self.search_loc,
                                              self.search_dist)
        results = self.GET(search_url)
                
        self.assertTrue(len(results) > 0)
        
    def test_text_geo_search(self):
        search_url = "{0}?s={1}&loc={2}&d={3}".format(self.url, 
                                                      self.search_string,
                                                      self.search_loc,
                                                      self.search_dist)
        results = self.GET(search_url)
                
        self.assertTrue(len(results) > 0)
    
