define(["underscore", "backbone", "model/ProjectModel"], function(_, Backbone, ProjectModel) {
  var ProjectListCollection;
  ProjectListCollection = Backbone.Collection.extend({
    model: ProjectModel,
    url: "/api/project/list",
    parse: function(response) {
      return response.data;
    }
  });
  return ProjectListCollection;
});
