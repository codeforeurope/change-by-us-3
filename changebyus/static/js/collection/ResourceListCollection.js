define(["underscore", "backbone", "model/ProjectModel"], function(_, Backbone, ProjectModel) {
  var ResourceListCollection;
  return ResourceListCollection = Backbone.Collection.extend({
    model: ProjectModel,
    url: "/api/project/list?limit=3&sort=created_at&order=desc&",
    parse: function(response) {
      return response.data;
    }
  });
});
