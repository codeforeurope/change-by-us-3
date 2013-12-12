define ["underscore", "backbone", "model/ProjectDiscussionCommentModel"], 
	(_, Backbone, ProjectDiscussionCommentModel) ->
		ProjectDiscussionCommentsCollection = Backbone.Collection.extend
			model: ProjectDiscussionCommentModel
			
			url: ->
				"/api/project/#{window.projectID}/discussion_comments"
			
			parse: (response) ->
				response.data
