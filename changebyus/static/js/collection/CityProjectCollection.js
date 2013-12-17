define(["underscore", "backbone", "model/ProjectModel"], function(_, Backbone, ProjectModel) {
  var CityProjectCollection;
  return CityProjectCollection = Backbone.Collection.extend({
    model: ProjectModel,
    url: function() {
      return "/api/project/list?limit=6&sort=activity&order=desc";
    },
    parse: function(response) {
      return response.data;
    }
  });
});
