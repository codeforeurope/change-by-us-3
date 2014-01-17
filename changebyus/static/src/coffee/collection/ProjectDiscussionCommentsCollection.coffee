define ["underscore", "backbone", "model/ProjectDiscussionCommentModel"], 
	(_, Backbone, ProjectDiscussionCommentModel) ->
		ProjectDiscussionCommentsCollection = Backbone.Collection.extend
			model: ProjectDiscussionCommentModel
			
			url: ->
				"/api/project/#{window.projectID}/discussion_comments"
			
			parse: (response_) ->
				if response_.success then response_.data else {}
