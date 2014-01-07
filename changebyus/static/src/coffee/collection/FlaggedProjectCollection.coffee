define ["underscore", "backbone", "model/ProjectModel"], 
	(_, Backbone, ProjectModel) ->
		FlaggedProjectCollection = Backbone.Collection.extend
			model: ProjectModel
			
			url: ->
				"/api/project/list?limit=6&sort=activity&order=desc"
			
			parse: (response) ->
				if response.success then response.data else {}