define ["underscore", "backbone", "model/ProjectDiscussionModel"], (_, Backbone, ProjectDiscussionModel) ->
  ProjectDiscussionsCollection = Backbone.Collection.extend(
    model: ProjectDiscussionModel
    url: "/api/project/" + window.projectID + "/discussions_list"
    parse: (response) ->
      response.data
  )
  ProjectDiscussionsCollection
