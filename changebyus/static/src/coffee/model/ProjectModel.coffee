define ["underscore", "backbone"], (_, Backbone) ->
  ProjectModel = Backbone.Model.extend(
    urlRoot: "/api/project/"
    defaults:
      name: ""
      description: ""
      category: ""
      zip: ""
      website: ""
      visibility: "private"
  )
  ProjectModel

