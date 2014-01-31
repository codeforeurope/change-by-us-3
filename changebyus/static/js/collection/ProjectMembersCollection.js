define(["underscore", "backbone", "model/UserModel"], function(_, Backbone, UserModel) {
  var ProjectMembersCollection;
  return ProjectMembersCollection = Backbone.Collection.extend({
    model: UserModel,
    order: 'name',
    initialize: function(models_, options) {
      this.options = options;
      return this.id = this.options.id;
    },
    url: function() {
      return "/api/project/" + this.id + "/users";
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
