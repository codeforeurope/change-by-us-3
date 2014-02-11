define(["underscore", "backbone", "model/UserModel"], function(_, Backbone, UserModel) {
  var ProjectMembersCollection;
  return ProjectMembersCollection = Backbone.Collection.extend({
    model: UserModel,
    order: 'name',
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
