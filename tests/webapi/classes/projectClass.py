import simplejson as json

from tests import (string_generator, email_generator, password_generator,
                   timestamp_generator, name_generator, text_generator,
                   unicode_generator, unicode_email_generator, zipcode_generator,
                   url_generator, gcal_code_generator, project_category_generator)


class ProjectClass():

    def __init__(self):
        self.name = name_generator()
        self.description = text_generator(100)
        self.category = project_category_generator()
        self.gcal_code = gcal_code_generator()
        # zipcode gets turned into proper location later
        self.location = zipcode_generator()

    def createResource(self, client):
        self.createProject(client, resource = True)

    def createProject(self, client, resource = False):
        loc_data = client.GET('/api/project/geopoint?s=%s' % self.location)['data'][0]
        self.location = loc_data['name']
        self.lat = loc_data['lat']
        self.lon = loc_data['lon']

        create = { 'name' : self.name,
                   'description' : self.description,
                   'category': self.category,
                   'gcal_code': self.gcal_code,
                   'location' : self.location,
                   'lat': self.lat,
                   'lon': self.lon }

        headers = {'Content-type': 'application/json', 'Accept': 'application/json'}
        resp = client.POST('/api/project/create', data = json.dumps(create), content_type="application/json")

        client.assertTrue( resp['success'] )
        client.assertTrue( resp['data']['name'] == self.name )

        self.project_id = resp['data']['id']
        self.data = resp['data']

        resp = client.GET( '/api/project/{0}'.format(self.project_id) )
        client.assertTrue( resp['data']['description'] == self.description )

    def edit(self, client, expected = True):

        edit = { 'project_id' : self.project_id,
                 'name' : self.name,
                 'description' : self.description,
                 'category': self.category,
                 'gcal_code': self.gcal_code,
                 'location' : self.location,
                 'lat': self.lat,
                 'lon': self.lon }

        resp = client.POST('/api/project/edit', data = json.dumps(edit), content_type="application/json")

        if expected:
            client.assertTrue( resp['success'] )
            client.assertTrue( resp['data']['name'] == self.name )
            client.assertTrue( resp['data']['description'] == self.description )
            self.data = resp['data']
        else:
            client.assertFalse( resp['success'] )

    def changeRoll(self, client, project_id, user_id, roll):

        role = { 'project_id' : project_id,
                 'user_id' : user_id,
                 'user_role' : roll }

        resp = client.POST('/api/project/change_user_role', data = json.dumps(role), content_type="application/json")

        client.assertTrue( resp['success'] )
