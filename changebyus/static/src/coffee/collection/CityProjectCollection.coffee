define ["underscore", "backbone", "model/ProjectModel"], 
	(_, Backbone, ProjectModel) ->
		CityProjectCollection = Backbone.Collection.extend
			model: ProjectModel
			
			url: ->
				"/api/city"
			
			parse: (response) ->
				response.data
