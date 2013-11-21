define ["underscore", "backbone", "model/ProjectDiscussionModel"], 
	(_, Backbone, ProjectDiscussionModel) ->
		ProjectDiscussionsCollection = Backbone.Collection.extend
			model: ProjectDiscussionModel
			
			url: "/api/post/project/" + window.projectID + "/list_discussions?sort=created_at&order=desc&"
			
			parse: (response) ->
				response.data
