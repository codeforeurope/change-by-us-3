define(["underscore", "backbone"], function(_, Backbone) {
  var CityModel;
  return CityModel = Backbone.Model.extend({
    urlRoot: "/api/project/",
    defaults: {
      name: "New York City",
      quote: "I believe in New Yorkers",
      image_url_round: "http://lorempixel.com/255/255",
      image_url_large_rect: "http://lorempixel.com/1020/430",
      website: "http://google.com",
      lat: 0,
      lon: 0
    },
    parse: function(resp_) {
      return {
        name: "New York City",
        quote: "I believe in New Yorkers",
        image_url_round: "http://lorempixel.com/255/255",
        image_url_large_rect: "http://lorempixel.com/1020/430",
        website: "http://google.com",
        lat: 0,
        lon: 0
      };
    }
  });
});
