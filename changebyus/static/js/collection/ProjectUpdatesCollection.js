define(["underscore", "backbone", "model/ProjectUpdateModel"], function(_, Backbone, ProjectUpdateModel) {
  var ProjectUpdatesCollection;
  ProjectUpdatesCollection = Backbone.Collection.extend({
    initialize: function(options) {
      return this.id = options.id;
    },
    model: ProjectUpdateModel,
    url: function() {
      return "/api/post/project/" + this.id + "/list_updates";
    },
    parse: function(response) {
      if (response.msg === "OK") {
        return response.data;
      } else {
        return {};
      }
    }
  });
  return ProjectUpdatesCollection;
});
