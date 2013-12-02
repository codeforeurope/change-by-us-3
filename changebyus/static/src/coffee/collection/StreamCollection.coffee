define ["underscore", "backbone", "model/ProjectUpdateModel", ], 
	(_, Backbone, ProjectUpdateModel) ->
		StreamCollection = Backbone.Collection.extend 
			model: ProjectUpdateModel

			url: ->
				"/api/stream"

			parse: (response) ->
				#console.log 'ProjectMembersCollection response',response
				if (response.msg is "OK") then response.data else {}

