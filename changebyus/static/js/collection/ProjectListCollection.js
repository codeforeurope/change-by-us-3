define(["underscore", "backbone", "model/ProjectModel"], function(_, Backbone, ProjectModel) {
  var ProjectListCollection;
  return ProjectListCollection = Backbone.Collection.extend({
    model: ProjectModel,
    url: "/api/project/list",
    parse: function(response) {
      return response.data;
    }
  });
});
