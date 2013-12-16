define(["underscore", "backbone", "model/ResourceModel"], function(_, Backbone, ResourceModel) {
  var CityResourceCollection;
  return CityResourceCollection = Backbone.Collection.extend({
    model: ResourceModel,
    url: function() {
      return "/api/city";
    },
    parse: function(response) {
      return response.data;
    }
  });
});
