define(["underscore", "backbone"], function(_, Backbone) {
  var ProjectDiscussionCommentModel;
  return ProjectDiscussionCommentModel = Backbone.Model.extend({
    parse: function(resp_) {
      if (resp_.data) {
        return resp_.data;
      } else {
        return resp_;
      }
    }
  });
});
