define(["underscore", "backbone"], function(_, Backbone) {
  var ProjectModel;
  return ProjectModel = Backbone.Model.extend({
    urlRoot: "/api/project/",
    defaults: {
      active: false,
      name: "",
      description: "",
      category: "",
      zip: "",
      website: "",
      visibility: "private"
    },
    parse: function(resp_) {
      if (resp_.data) {
        return resp_.data;
      } else {
        return resp_;
      }
    }
  });
});
