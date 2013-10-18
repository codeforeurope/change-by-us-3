define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
  var AbstractView;
  return AbstractView = Backbone.View.extend({
    parent: "body",
    templateDir: "/static",
    viewData: {},
    id: 0,
    initialize: function(options_) {
      var options;
      options = options_ || {};
      this.id = options.id || this.id;
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.viewData = options.viewData || this.viewData;
      return console.log('options_', options.parent, this.parent);
    },
    show: function() {
      return this.$el.show();
    },
    hide: function() {
      return this.$el.hide();
    }
  });
});
