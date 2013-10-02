define ["underscore", "backbone", "model/ProjectMemberModel"], (_, Backbone, ProjectMemberModel) ->
  ProjectMemberCollection = Backbone.Collection.extend(
    initialize: (options) ->
      @id = options.id

    model: ProjectMemberModel
    url: ->
      "/api/project/" + @id + "/users"

    parse: (response) ->
      (if (response.msg is "OK") then response.data else {})
  )
  ProjectMemberCollection

