define(["underscore", "backbone", "model/ProjectUpdateModel"], function(_, Backbone, ProjectUpdateModel) {
  var StreamCollection;
  return StreamCollection = Backbone.Collection.extend({
    model: ProjectUpdateModel,
    url: function() {
      return "/api/stream";
    },
    parse: function(response) {
      if (response.msg === "OK") {
        return response.data;
      } else {
        return {};
      }
    }
  });
});
