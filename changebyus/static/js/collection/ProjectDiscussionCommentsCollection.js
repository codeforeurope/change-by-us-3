define(["underscore", "backbone", "model/ProjectDiscussionCommentModel"], function(_, Backbone, ProjectDiscussionCommentModel) {
  var ProjectDiscussionCommentsCollection;
  ProjectDiscussionCommentsCollection = Backbone.Collection.extend({
    model: ProjectDiscussionCommentModel,
    url: "/api/project/" + window.projectID + "/discussion_comments",
    parse: function(response) {
      return response.data;
    }
  });
  return ProjectDiscussionCommentsCollection;
});
