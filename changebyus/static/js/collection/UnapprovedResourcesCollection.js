define(["underscore", "backbone", "model/ProjectModel"], function(_, Backbone, ProjectModel) {
  var UnapprovedResourcesCollection;
  return UnapprovedResourcesCollection = Backbone.Collection.extend({
    model: ProjectModel,
    url: function() {
      return "/api/project/list?is_resource=true&";
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
