define(["underscore", "backbone", "model/UpdateModel"], function(_, Backbone, UpdateModel) {
  var UpdatesCollection;
  return UpdatesCollection = Backbone.Collection.extend({
    model: UpdateModel,
    initialize: function(options) {
      return this.id = options.id;
    },
    url: function() {
      return "/api/post/project/" + this.id + "/list_updates?sort=created_at&order=desc&";
    },
    parse: function(response) {
      if (response.success) {
        return response.data;
      } else {
        return {};
      }
    }
  });
});
