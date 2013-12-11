import simplejson as json

from tests import (string_generator, email_generator, password_generator,
                   timestamp_generator, name_generator, text_generator,
                   unicode_generator, unicode_email_generator, zipcode_generator,
                   url_generator, gcal_code_generator, project_category_generator)

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

        resp = client.POST('/api/post/add/update', data = json.dumps(update), content_type="application/json")

        if expected:
            client.assertTrue( resp['success'] )
            self.update_id = resp['data']['id']
            self.data = resp['data']
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

        resp = client.POST('/api/post/add/discussion', data = json.dumps(update), content_type="application/json")

        if expected:
            client.assertTrue( resp['success'] )
            self.discussion_id = resp['data']['id']
            self.data = resp['data']
        else:
            client.assertFalse( resp['success'] )


    def deletePost(self,
                   client,
                   post_id=None,
                   expected=True):

        delete = { 'post_id' : post_id }
    
        resp = client.POST('/api/post/delete', data = json.dumps(delete), content_type="application/json")

        client.assertTrue( resp['success'] == expected )
