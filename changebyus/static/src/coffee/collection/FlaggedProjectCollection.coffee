define ["underscore", "backbone", "model/ProjectModel"], 
	(_, Backbone, ProjectModel) ->
		FlaggedProjectCollection = Backbone.Collection.extend
			model: ProjectModel
			
			url: ->
				"/api/project/list?flagged=1&"
			
			parse: (response) ->
				if response.success then response.data else {}