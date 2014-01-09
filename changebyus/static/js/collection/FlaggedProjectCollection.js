define(["underscore", "backbone", "model/ProjectModel"], function(_, Backbone, ProjectModel) {
  var FlaggedProjectCollection;
  return FlaggedProjectCollection = Backbone.Collection.extend({
    model: ProjectModel,
    url: function() {
      return "/api/project/list?flagged=1&";
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