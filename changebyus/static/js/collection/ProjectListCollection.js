define(["underscore", "backbone", "model/ProjectModel"], function(_, Backbone, ProjectModel) {
  var ProjectListCollection;
  return ProjectListCollection = Backbone.Collection.extend({
    model: ProjectModel,
    url: "/api/project/list?limit=6&sort=activity&order=desc",
    parse: function(response) {
      return response.data;
    }
  });
});
