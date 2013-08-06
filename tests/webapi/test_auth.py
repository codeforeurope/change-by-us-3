# -*- coding: utf-8 -*-
"""
    NS11MM Test Views
    ~~~~~~~~~~~~~~~~~~~~

    Test all the views of the NS11 Museum Backend functionality

    :copyright: (c) 2012 Local Projects
    :license:
"""
from __future__ import with_statement
from lib import encode_model
from tests import BaseTestCase
import re
import simplejson as json



class BaseAuthTests(BaseTestCase):
    users = {}
    def tearDown(self):
        # Delete all test users
        test_users = Users.objects(login__istartswith="test_")        
        for test_user in test_users:
            test_user.delete()
            
    def create_user(self, role=None):
        name = "Test User: %s" % role 
        login = "test_%s@lptest.net" % role
        email = "test_%s@lptest.net" % role
        password = 'password'
        defaults = {'email': email, 'roles': [role], 'password': password}

        user, created = Users.objects.get_or_create(name=name, login=login, 
                                                    defaults=defaults)
        if not created:
            user.roles = [role]
        user.save()
        self.users[role] = {'login': email, 'password': password}
            
class AuthBasicTests(BaseAuthTests):
    def test_accessing_restricted_resource_should_error(self):
        """
        TODO:
            May need to add follow_redirects=True to the get/post call
        """
        # do a full http response since we should be getting HTML
        response = self.GET('/users')
        self.assertEqual(response.status_code, 302, str(response))
        self.assertTrue(re.search('login', response.location), str(response.location))
        
    def test_logout_should_succeed_and_remove_session(self):
        data = self.GET('/logout')
        self.assertEqual(data.get('code'), 200, str(data))
        
        # Re-Validate the restricted resource test
        self.test_accessing_restricted_resource_should_error()
        
    def test_login_should_succeeed(self):
        next = "users"
        response = self.login_as(next=next, **self.admin_user)
        # Should be taken to the "next" screen
        self.assertTrue(response.location == 'http://localhost/%s' % next, str(response.location))
        data = self.GET('/users')
        self.assertEqual(data.get('code'), 200, str(data))         
        self.assertTrue(len(data.get('data')) == Users.objects.count(), str(data))
        
class AuthCRUDTests(BaseAuthTests):
    def test_deactivate_user_only_allowed_by_admin_user_not_others(self):
        self.login_as(**self.admin_user)
        
        try:
            non_admin_user = Users.objects(roles__nin=['admin']).first()
        except Exception, e:
            raise
        
        self.POST('/user/deactivate', data={"id":non_admin_user.id})
        user = Users.objects(id=non_admin_user.id).first()
        self.assertTrue(user.inactive == True, encode_model(user))
        
        # Re-activate the user
        self.POST('/user/activate', data={"id":non_admin_user.id})
        user = Users.objects(id=non_admin_user.id).first()
        self.assertTrue(user.inactive == False, encode_model(user))

    def test_create_new_users(self):
        self.assertTrue(Users.objects(login="test_form_user@lp.net").count() == 0)
        self.assertTrue(Users.objects(login="test_json_user@lp.net").count() == 0)
        roles = ["moderator", "editor"]
        # Roles are causing a problem since werkzeug is flattening the list, so don't 
        # use roles in the form request data for now
        form_user_data = {"name": "Test User", "login": "test_form_user@lp.net", 
                          "password":"password", "confirm": "password",
                          "accept_tos": True}
        response = self.POST("/user/add", data=form_user_data)
        data = response.get('data')
        code = response.get('code')
        
        self.assertEqual(code, 200)
        self.assertTrue(Users.objects(login="test_form_user@lp.net").count() == 1)
        new_user = Users.objects(login="test_form_user@lp.net").first()
        # self.assertTrue(new_user.roles == roles, encode_model(new_user))
    
        # Do the same thing with json instead of form-data
        # Form data is not being sent correctly by Flask/werkzeug!!!
        json_user_data = {"name": "Test User", "login": "test_json_user@lp.net", 
                          "password":"password", "confirm": "password",
                          "accept_tos": "checked", "roles": roles }
        resp = self.POST("/user/add", 
                         data=json.dumps(json_user_data),
                         content_type="application/json" )
        data = resp.get('data')
        code = resp.get('code')
        
        self.assertEqual(code, 200)
        self.assertTrue(Users.objects(login="test_json_user@lp.net").count() == 1)
        new_user = Users.objects(login="test_json_user@lp.net").first()
        self.assertTrue(new_user.roles == roles, encode_model(new_user))
        

    def test_create_existing_user(self):
        self.assertTrue(Users.objects(login="test_form_user@lp.net").count() == 1)
        data = self.POST("/user/add",
                         data={"name": "Test User", "login": "test_form_user@lp.net", 
                               "password":"password", "confirm": "password",
                               "accept_tos": True })
        
        self.assertTrue(data.get('code') == 500, str(data))
        self.assertTrue(Users.objects(login="test_form_user@lp.net").count() == 1)
        
    def _test_update_user(self):
        response = self.login_as(**self.admin_user)
        # Do the same thing with json instead of form-data
        # Form data is not being sent correctly by Flask/werkzeug!!!
        
        old_user = Users.objects(login=self.json_user.get("login")).first()
        json_user_data = {"name": "Test Updated User", "login": self.json_user.get('login'), 
                          "accept_tos": "true"}
        data = self.POST("/user/update", 
                                    data=json.dumps(json_user_data),
                                    content_type="application/json")
        self.assertTrue(data.get('code') == 200, str(data))
        
        users = Users.objects(login=self.json_user.get('login'))
        self.assertTrue(users.count() == 1)
        user = users.first()
        self.assertTrue(user.name == json_user_data.get('name'))
        self.assertTrue(user.password == old_user.password)
        
        # Change password
        new_password = "new_password"
        json_user_data = {"name": "Test Updated User", "login": self.json_user.get('login'), 
                          "accept_tos": "true", 
                          "password":  new_password, "confirm": new_password}
        data = self.POST("/user/update", 
                                    data=json.dumps(json_user_data),
                                    content_type="application/json" )
        self.assertTrue(data.get('code') == 200, str(data))
        users = Users.objects(login=self.json_user.get('login'))
        self.assertTrue(users.count() == 1)
        user = users.first()
        self.assertTrue(user.name == "Test Updated User")
        self.assertTrue(user.authenticate(json_user_data.get('password')) == True)
        
        # Try to set blank password
        new_password = ""
        json_user_data = {"name": "Test Updated User", "login": self.json_user.get('login'), 
                          "accept_tos": "true", 
                          "password":  new_password, "confirm": new_password}
        data = self.POST("/user/update", 
                                    data=json.dumps(json_user_data),
                                    content_type="application/json" )
        self.assertTrue(data.get('code') == 200, str(data))
        users = Users.objects(login=self.json_user.get('login'))
        self.assertTrue(users.count() == 1)
        user = users.first()
        self.assertFalse(user.password == json_user_data.get('password'))
        
    def _test_update_user_login_should_fail(self):
        """Login cannot be altered"""
        response = self.login_as(**self.admin_user)
        # Do the same thing with json instead of form-data
        # Form data is not being sent correctly by Flask/werkzeug!!!
        
        old_user = Users.objects(login=self.json_user.get("login"), login__ne = self.admin_user).first()
        json_user_data = {"name": "Test Updated User", "login": self.json_user.get('login')}
        data = self.POST("/user/update", 
                                data=json.dumps(json_user_data),
                                content_type="application/json")
        self.assertTrue(data.get('code') == 200, str(data))
        
        user = Users.objects(login=self.json_user.get('login')).first()
        self.assertTrue(user.login == old_user.login, encode_model(user))        

    def test_deactivate_user(self):
        """Deactivating user should work"""
        response = self.login_as(**self.admin_user)
        # Do the same thing with json instead of form-data
        # Form data is not being sent correctly by Flask/werkzeug!!!
        
        old_user = Users.objects(login=self.json_user.get("login"), login__ne = self.admin_user).first()
        # Toggle inactive flog
        for inactive in [not old_user.inactive, old_user.inactive]:
            json_user_data = {"id": str(old_user.id), "inactive": inactive}
        
            data = self.POST("/user/update", 
                                    data=json.dumps(json_user_data),
                                    content_type="application/json")
            self.assertTrue(data.get('code') == 200, str(data))
            
            user = Users.objects(id=old_user.id).first()
            self.assertEqual(user.inactive, json_user_data.get('inactive'), encode_model(user))
            self.assertEqual(user.password, old_user.password, encode_model(user))        
        
    def test_delete_user(self):
        # Create dummy users since tearDown will have removed users
        self.login_as(**self.admin_user)
        self.test_create_new_users()
        self.assertTrue(Users.objects(login="test_form_user@lp.net").count() == 1)
        self.assertTrue(Users.objects(login=self.json_user.get('login')).count() == 1)
        
        non_admin_user = Users.objects(roles__nin=['admin']).first()
        
        resp = self.POST("/user/delete", 
                         data=json.dumps({"login":"test_form_user@lp.net"}), 
                         content_type="application/json")
        self.assertEqual(resp.get('code'), 200)
        self.assertTrue(Users.objects(login="test_form_user@lp.net").count() == 0)
        respo = self.POST("/user/delete", data=json.dumps({"login":"test_json_user@lp.net"}), content_type="application/json")
        self.assertEqual(resp.get('code'), 200)
        self.assertTrue(Users.objects(login="test_json_user@lp.net").count() == 0)

    def test_xhr_response_errors(self):
        self.login_as(**self.admin_user)
        
        json_user_data = {"accept_tos":"true",
                          "name":"dasdasd",
                          "login":"asdasd",
                          "roles":["admin"],
                          "password":"asdasd","confirm":"asdasd"}

        # First try as "normal" HTTP request
        resp = self.POST('/user/update', data=json.dumps(json_user_data),
                         content_type="application/json")
        # we should get HTML form response here since it's not XHR
        try:
            data = resp.get('data')
        except json.JSONDecodeError, e:
            pass
        except Exception, e:
            self.fail("Failed with exception %s" % str(e))

        # Now try as XHR
        resp = self.POST('/user/update', data=json.dumps(json_user_data),
                                    headers={'X-Requested-With' : 'XMLHttpRequest'},
                                    content_type="application/json"
                                    )
        self.assertTrue(resp is not None, str(resp))
        
class AuthRolesTests(BaseAuthTests):
    def setUp(self):
        for role in ROLES_INFO.keys():
            self.create_user(role=role)

    def test_non_admin_role_should_only_list_self(self):
        """Victim-manager should not be able to create user"""
        self.login_as(**self.users.get('victim_manager'))
        
        resp = self.GET("/user/show")
        code = resp.get('code')
        data = resp.get('data')
        self.assertEqual(code, 200)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0].get('login'), self.users.get('victim_manager').get('login'))

    def test_victim_manager_role_should_not_delete_user(self):
        """Victim-manager should not be able to create user"""
        resp = self.login_as(**self.users.get('victim_manager'))
        
        data = json.dumps(self.users.get('victim_editor'))
        resp = self.POST("/user/delete", 
                         data=data, 
                         content_type="application/json")
        self.assertTrue('403' in resp.data)
        
        
        