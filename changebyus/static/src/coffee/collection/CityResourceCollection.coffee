define ["underscore", "backbone", "model/ResourceModel"], 
	(_, Backbone, ResourceModel) ->
		CityResourceCollection = Backbone.Collection.extend
			model: ResourceModel
			
			url: ->
				"/api/city"
			
			parse: (response) ->
				response.data
