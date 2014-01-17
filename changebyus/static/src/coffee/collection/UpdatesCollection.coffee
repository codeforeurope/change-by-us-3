define ["underscore", "backbone", "model/UpdateModel"], 
	(_, Backbone, UpdateModel) ->
		UpdatesCollection = Backbone.Collection.extend 
			model: UpdateModel
			
			initialize: (options_) ->
				@id = options_.id

			url: -> 
				"/api/post/project/#{@id}/updates?sort=created_at&order=desc&"

			parse: (response_) ->
				if response_.success then response_.data else {}

