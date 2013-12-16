define ["underscore", "backbone", "model/ProjectModel"],
	(_, Backbone, ProjectModel) ->
		ResourceListCollection = Backbone.Collection.extend
			model: ProjectModel
			 
			url: ->
				"/api/project/list?limit=3&sort=created_at&order=desc&"
			
			parse: (response) ->
				if response.success then response.data else {}