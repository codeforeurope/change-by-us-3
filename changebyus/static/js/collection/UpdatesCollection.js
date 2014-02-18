define(["underscore", "backbone", "model/UpdateModel"], function(_, Backbone, UpdateModel) {
  var UpdatesCollection;
  return UpdatesCollection = Backbone.Collection.extend({
    model: UpdateModel,
    url: function() {
      return "/api/post/project/" + this.id + "/updates?sort=created_at&order=desc&";
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
