define(["underscore", "backbone"], function(_, Backbone) {
  var ProjectMembersModel;
  return ProjectMembersModel = Backbone.Model.extend({
    parse: function(resp_) {
      if (resp_.data) {
        return resp_.data;
      } else {
        return resp_;
      }
    }
  });
});
