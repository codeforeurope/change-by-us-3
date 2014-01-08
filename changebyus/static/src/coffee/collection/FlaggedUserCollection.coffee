define ["underscore", "backbone", "model/ProjectModel"], 
	(_, Backbone, ProjectModel) ->
		FlaggedUserCollection = Backbone.Collection.extend
			model: ProjectModel
			
			url: ->
				#"/api/user/list?flagged=1&"
				"/api/user/list"
			
			parse: (response) ->
				if response.success then response.data else {}