define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
  var AbstractView;
  AbstractView = Backbone.View.extend({
    parent: "body",
    templateDir: "/static",
    viewData: {},
    initialize: function(options_) {
      var options;
      options = options_ || {};
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      return this.viewData = options.viewData || this.viewData;
    },
    show: function() {
      return this.$el.show();
    },
    hide: function() {
      return this.$el.hide();
    }
  });
  return AbstractView;
});
