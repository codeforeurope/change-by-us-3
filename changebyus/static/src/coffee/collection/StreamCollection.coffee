define ["underscore", "backbone", "model/ProjectUpdateModel", ], 
	(_, Backbone, ProjectUpdateModel) ->
		StreamCollection = Backbone.Collection.extend 
			model: ProjectUpdateModel

			url: ->
				"/api/stream"

			parse: (response) -> 
				if (response.msg is "OK") then response.data else {}

