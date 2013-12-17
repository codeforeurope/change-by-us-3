define ["underscore", "backbone", "model/ProjectDiscussionModel"], 
	(_, Backbone, ProjectDiscussionModel) ->
		ProjectDiscussionsCollection = Backbone.Collection.extend
			model: ProjectDiscussionModel
			
			url: ->
				"/api/post/project/#{window.projectID}/discussions?sort=created_at&order=desc&"
			
			parse: (response) ->
				if response.success then response.data else {}
