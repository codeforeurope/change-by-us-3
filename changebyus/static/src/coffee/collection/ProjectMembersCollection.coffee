define ["underscore", "backbone", "model/UserModel", ], 
	(_, Backbone, UserModel) ->
		ProjectMembersCollection = Backbone.Collection.extend 
			model: UserModel
			
			initialize: (options) ->
				@id = options.id

			url: ->
				"/api/project/" + @id + "/users"

			parse: (response) ->
				#console.log 'ProjectMembersCollection response',response
				if (response.msg is "OK") then response.data else {}

