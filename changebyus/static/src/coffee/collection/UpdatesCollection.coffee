define ["underscore", "backbone", "model/UpdateModel"], 
	(_, Backbone, UpdateModel) ->
		UpdatesCollection = Backbone.Collection.extend 
			model: UpdateModel
			
			initialize: (options) ->
				@id = options.id

			url: -> 
				"/api/post/project/#{@id}/updates?sort=created_at&order=desc&"

			parse: (response) ->
				if response.success then response.data else {}

