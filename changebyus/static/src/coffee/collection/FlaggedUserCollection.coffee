define ["underscore", "backbone", "model/ProjectModel"], 
	(_, Backbone, ProjectModel) ->
		FlaggedUserCollection = Backbone.Collection.extend
			model: ProjectModel
			
			url: -> 
				"/api/user/list"
			
			parse: (response_) ->
				if response_.success then response_.data else {}