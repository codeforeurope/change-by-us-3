define ["underscore", "backbone", "model/ProjectModel"], (_, Backbone, ProjectModel) ->
	ResourceListCollection = Backbone.Collection.extend
		model: ProjectModel
		
		#url: "/api/project/list?limit=3&sort=created_at&order=desc&is_resource=1"
		url: "/api/project/list?limit=3&sort=created_at&order=desc&"
		
		parse: (response) ->
			response.data 
 