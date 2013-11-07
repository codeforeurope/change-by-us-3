define(["underscore", "backbone", "model/ProjectUpdateModel"], function(_, Backbone, ProjectUpdateModel) {
  var ProjectMembersCollection;
  return ProjectMembersCollection = Backbone.Collection.extend({
    model: UserModel,
    initialize: function(options) {
      return this.id = options.id;
    },
    url: function() {
      return "/api/post/project/" + this.id + "/users";
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
