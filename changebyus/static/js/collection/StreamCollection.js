define(["underscore", "backbone", "model/UpdateModel"], function(_, Backbone, UpdateModel) {
  var StreamCollection;
  return StreamCollection = Backbone.Collection.extend({
    model: UpdateModel,
    url: function() {
      return "/api/stream";
    },
    parse: function(response_) {
      if (response_.success) {
        return response_.data;
      } else {
        return {};
      }
    }
  });
});
