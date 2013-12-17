define(["underscore", "backbone", "model/ResourceModel"], function(_, Backbone, ResourceModel) {
  var CityResourceCollection;
  return CityResourceCollection = Backbone.Collection.extend({
    model: ResourceModel,
    url: function() {
      return "/api/project/list?limit=6&sort=activity&order=asc";
    },
    parse: function(response) {
      return response.data;
    }
  });
});
