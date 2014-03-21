define(["underscore", "backbone"], function(_, Backbone) {
  var UpdateModel;
  return UpdateModel = Backbone.Model.extend({
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
