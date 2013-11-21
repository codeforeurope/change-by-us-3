define(["underscore", "backbone", "model/ProjectDiscussionModel"], function(_, Backbone, ProjectDiscussionModel) {
  var ProjectDiscussionsCollection;
  return ProjectDiscussionsCollection = Backbone.Collection.extend({
    model: ProjectDiscussionModel,
    url: "/api/post/project/" + window.projectID + "/list_discussions?sort=created_at&order=desc&",
    parse: function(response) {
      return response.data;
    }
  });
});
