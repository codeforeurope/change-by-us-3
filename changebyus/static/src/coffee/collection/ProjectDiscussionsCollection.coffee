define ["underscore", "backbone", "model/ProjectDiscussionModel"], 
	(_, Backbone, ProjectDiscussionModel) ->
		ProjectDiscussionsCollection = Backbone.Collection.extend
			model: ProjectDiscussionModel
			
			url: "/api/post/project/" + window.projectID + "/list_discussions"
			
			parse: (response) ->
				response.data
