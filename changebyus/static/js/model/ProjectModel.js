define(["underscore", "backbone"], function(_, Backbone) {
  var ProjectModel;
  return ProjectModel = Backbone.Model.extend({
    urlRoot: "/api/project/",
    defaults: {
      name: "",
      description: "",
      category: "",
      zip: "",
      website: "",
      visibility: "private"
    }
  });
});
