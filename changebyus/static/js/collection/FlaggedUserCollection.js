define(["underscore", "backbone", "model/ProjectModel"], function(_, Backbone, ProjectModel) {
  var FlaggedUserCollection;
  return FlaggedUserCollection = Backbone.Collection.extend({
    model: ProjectModel,
    url: function() {
      return "/api/user/list";
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
