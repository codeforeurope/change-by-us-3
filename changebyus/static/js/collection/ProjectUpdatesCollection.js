define(["underscore", "backbone", "model/ProjectUpdateModel"], function(_, Backbone, ProjectUpdateModel) {
  var ProjectUpdatesCollection;
  return ProjectUpdatesCollection = Backbone.Collection.extend({
    model: ProjectUpdateModel,
    initialize: function(options) {
      return this.id = options.id;
    },
    url: function() {
      return "/api/post/project/" + this.id + "/list_updates?sort=created_at&order=desc&";
    },
    parse: function(response) {
      if (response.msg === "OK") {
        return response.data;
      } else {
        return {};
      }
    }
  });
});
