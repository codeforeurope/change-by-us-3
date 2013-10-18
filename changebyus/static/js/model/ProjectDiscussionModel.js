define(["underscore", "backbone"], function(_, Backbone) {
  var ProjectDiscussionModel;
  return ProjectDiscussionModel = Backbone.Model.extend({
    urlRoot: "",
    "default": {
      description: "",
      title: "",
      created_at: "2000-01-01 00:00:00.000000",
      updated_at: "2000-01-01 00:00:00.000000",
      id: "0",
      project: {
        id: "0",
        collection: ""
      },
      user: {
        id: "0",
        collection: ""
      },
      "public": false,
      responses: []
    }
  });
});
