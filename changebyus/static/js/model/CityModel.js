define(["underscore", "backbone"], function(_, Backbone) {
  var CityModel;
  return CityModel = Backbone.Model.extend({
    parse: function(resp_) {
      if (resp_.data) {
        return resp_.data;
      } else {
        return resp_;
      }
    }
  });
});
