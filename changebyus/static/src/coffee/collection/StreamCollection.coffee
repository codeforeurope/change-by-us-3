define ["underscore", "backbone", "model/UpdateModel", ], 
	(_, Backbone, UpdateModel) ->
		StreamCollection = Backbone.Collection.extend 
			model: UpdateModel

			url: ->
				"/api/stream"

			parse: (response) -> 
				if (response.msg is "OK") then response.data else {}

