define(["underscore", "backbone", "model/ProjectDiscussionCommentModel"], function(_, Backbone, ProjectDiscussionCommentModel) {
  var ProjectDiscussionCommentsCollection;
  return ProjectDiscussionCommentsCollection = Backbone.Collection.extend({
    model: ProjectDiscussionCommentModel,
    url: function() {
      return "/api/project/" + window.projectID + "/discussion_comments";
    },
    parse: function(response_) {
      if (response_.success) {
        return response_.data;
      } else {
        return {};
      }
    }
  });
});
