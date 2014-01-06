define(["underscore", "backbone", "model/UserModel"], function(_, Backbone, UserModel) {
  var ProjectMembersCollection;
  return ProjectMembersCollection = Backbone.Collection.extend({
    model: UserModel,
    order: 'name',
    initialize: function(options) {
      return this.id = options.id;
    },
    url: function() {
      return "/api/project/" + this.id + "/users";
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
