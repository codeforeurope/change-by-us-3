define(["underscore", "backbone", "model/ProjectModel"], function(_, Backbone, ProjectModel) {
  var CityProjectCollection;
  return CityProjectCollection = Backbone.Collection.extend({
    model: ProjectModel,
    url: function() {
      return "/api/city";
    },
    parse: function(response) {
      return response.data;
    }
  });
});
