# -*- coding: utf-8 -*-
from .models import Project

def _get_posts_for_project(project_id = None, private_posts = False):

	if private_posts:
		posts = Project.objects( parent = None, 
			                     project = project_id )
	else:
		posts = Projects.objects( parent = None, 
			                      project = project_id,
			                      public = True )