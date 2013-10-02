define ["underscore", "backbone", "model/ProjectCalendarModel"], (_, Backbone, ProjectCalendarModel) ->
  ProjectCalendarCollection = Backbone.Collection.extend(
    initialize: (options) ->
      @id = options.id

    model: ProjectCalendarModel
    url: ->
      "/api/project/" + @id + "/calendar"

    parse: (response) ->
      (if (response.msg is "OK") then response.data else {})
  )
  ProjectCalendarCollection 