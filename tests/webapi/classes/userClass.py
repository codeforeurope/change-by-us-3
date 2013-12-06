import simplejson as json

from tests import (string_generator, email_generator, password_generator,
                   timestamp_generator, name_generator, text_generator,
                   unicode_generator, unicode_email_generator, zipcode_generator,
                   url_generator, gcal_code_generator, project_category_generator)


class UserClass():

    def __init__(self):

        self.email = email_generator()
        self.pw = password_generator()
        self.name = name_generator()
        self.fname = self.name
        self.lname = self.name
        self.dname = self.name
        self.bio = text_generator(50)
        self.website = url_generator()
        self.location = zipcode_generator()

    def s(self, field, val):
        self.vars[field] = val

    def g(self, field):
        return self.vars[field]

    def createUser(self, client):
        loc_data = client.GET('/api/project/geopoint?s=%s' % self.location)['data'][0]
        self.location = loc_data['name']
        self.lat = loc_data['lat']
        self.lon = loc_data['lon']    
    
        create = {'email' : self.email,
                  'password' : self.pw,
                  'display_name' : self.dname,
                  'first_name' : self.fname,
                  'last_name' : self.lname,
                  'bio': self.bio,
                  'website': self.website,
                  'location': self.location,
                  'lat': self.lat,
                  'lon': self.lon}

        resp = client.POST('/api/user/create', data = json.dumps(create), content_type="application/json")
        client.assertTrue( resp['success'] )
        self.user_id = resp['data']['id']
        self.data = resp['data']

    ## TODO: No edit user test?

    def login(self, client):
        login = {'email' : self.email, 
                 'password' : self.pw}

        resp = client.POST('/login', data = json.dumps(login), content_type="application/json")
        client.assertTrue( resp['success'] )

    def joinProject(self, client, project_id):

        join = { 'project_id' : project_id }
        resp = client.POST('/api/project/join', data = json.dumps(join), content_type="application/json")
        client.assertTrue( resp['success'] )

        resp = client.GET( '/api/project/user/{0}/joined-projects'.format(self.user_id) )
        
        joined = False
        for project in resp['data']:
            if project['id'] == project_id:
                joined = True

        client.assertTrue( joined )

    def followResource(self, client, resource_id):

        join = { 'project_id' : resource_id }
        resp = client.POST('/api/resource/follow', data = json.dumps(join), content_type="application/json")
        #print "RESPONSE FOR JOIN RESOURCE IS ", resp
        client.assertTrue( resp['success'] )

