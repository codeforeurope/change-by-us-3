define ["underscore", "backbone", "model/ProjectModel"], 
	(_, Backbone, ProjectModel) ->
		FlaggedUserCollection = Backbone.Collection.extend
			model: ProjectModel
			
			url: -> 
				"/api/user/list?flagged=1&"
			
			parse: (response_) ->
				if response_.success then response_.data else {}