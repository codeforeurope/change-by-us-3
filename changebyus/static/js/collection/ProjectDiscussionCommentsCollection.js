define(["underscore", "backbone", "model/ProjectDiscussionCommentModel"], function(_, Backbone, ProjectDiscussionCommentModel) {
  var ProjectDiscussionCommentsCollection;
  return ProjectDiscussionCommentsCollection = Backbone.Collection.extend({
    model: ProjectDiscussionCommentModel,
    url: function() {
      return "/api/project/" + window.projectID + "/discussion_comments";
    },
    parse: function(response) {
      if (response.success) {
        return response.data;
      } else {
        return {};
      }
    }
  });
});
