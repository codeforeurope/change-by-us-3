define(["underscore", "backbone", "model/UpdateModel"], function(_, Backbone, UpdateModel) {
  var StreamCollection;
  return StreamCollection = Backbone.Collection.extend({
    model: UpdateModel,
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
