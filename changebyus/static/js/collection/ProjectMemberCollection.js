define(["underscore", "backbone", "model/ProjectMemberModel"], function(_, Backbone, ProjectMemberModel) {
  var ProjectMemberCollection;
  ProjectMemberCollection = Backbone.Collection.extend({
    initialize: function(options) {
      return this.id = options.id;
    },
    model: ProjectMemberModel,
    url: function() {
      return "/api/project/" + this.id + "/users";
    },
    parse: function(response) {
      if (response.msg === "OK") {
        return response.data;
      } else {
        return {};
      }
    }
  });
  return ProjectMemberCollection;
});
