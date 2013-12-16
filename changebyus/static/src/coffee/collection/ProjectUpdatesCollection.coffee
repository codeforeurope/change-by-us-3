define ["underscore", "backbone", "model/UpdateModel"], 
	(_, Backbone, UpdateModel) ->
		ProjectUpdatesCollection = Backbone.Collection.extend 
			model: UpdateModel
			
			initialize: (options) ->
				@id = options.id

			url: -> 
				"/api/post/project/#{@id}/list_updates?sort=created_at&order=desc&"

			parse: (response) ->
				if (response.msg is "OK") then response.data else {}

