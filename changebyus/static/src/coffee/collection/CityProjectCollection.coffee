define ["underscore", "backbone", "model/ProjectModel"], 
	(_, Backbone, ProjectModel) ->
		CityProjectCollection = Backbone.Collection.extend
			model: ProjectModel
			
			url: ->
				"/api/project/list?limit=6&sort=activity&order=desc"
				#"/api/city"
			
			parse: (response) ->
				response.data
