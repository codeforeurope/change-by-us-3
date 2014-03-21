define(["underscore", "backbone", "model/CityModel"], function(_, Backbone, CityModel) {
  var CityCollection;
  return CityCollection = Backbone.Collection.extend({
    model: CityModel,
    url: function() {
      return "/api/project/cities";
    },
    parse: function(response_) {
      if (response_.success) {
        return response_.data.cities;
      } else {
        return {};
      }
    }
  });
});
