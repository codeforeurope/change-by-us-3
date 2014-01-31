define(["underscore", "backbone", "model/ProjectDiscussionModel"], function(_, Backbone, ProjectDiscussionModel) {
  var ProjectDiscussionsCollection;
  return ProjectDiscussionsCollection = Backbone.Collection.extend({
    model: ProjectDiscussionModel,
    initialize: function(models_, options) {
      this.options = options;
      return this.id = this.options.id;
    },
    url: function() {
      return "/api/post/project/" + this.id + "/discussions?sort=created_at&order=desc&";
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
