define ["underscore", "backbone", "model/ResourceModel"], 
	(_, Backbone, ResourceModel) ->
		CityResourceCollection = Backbone.Collection.extend
			model: ResourceModel
			
			url: ->
				"/api/project/list?limit=6&sort=activity&order=asc"
				#"/api/city"
			
			parse: (response) ->
				response.data
