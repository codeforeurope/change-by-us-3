define(["underscore", "backbone"], function(_, Backbone) {
  var CityModel;
  return CityModel = Backbone.Model.extend({
    urlRoot: "/api/project/",
    defaults: {
      name: "New York City",
      quote: "I believe in New Yorkers",
      avatar: "http://lorempixel.com/255/255",
      background: "http://lorempixel.com/1020/430",
      website: "http://google.com"
    },
    parse: function(resp_) {
      return {
        name: "New York City",
        quote: "I believe in New Yorkers",
        avatar: "http://lorempixel.com/255/255",
        background: "http://lorempixel.com/1020/430",
        website: "http://google.com"
      };
    }
  });
});
