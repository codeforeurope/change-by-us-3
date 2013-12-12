define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
  var AbstractView;
  return AbstractView = Backbone.View.extend({
    parent: "body",
    templateDir: "/static",
    viewData: {},
    templateLoaded: false,
    delayedCollectionLoad: false,
    id: 0,
    initialize: function(options_) {
      var options;
      options = options_ || {};
      this.id = options.id || this.id;
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      return this.viewData = options.viewData || this.viewData;
    },
    onTemplateLoad: function() {
      this.trigger('ON_TEMPLATE_LOAD');
      this.templateLoaded = true;
      if (this.delayedCollectionLoad) {
        this.loadData();
      }
      return this.delegateEvents();
    },
    changeHash: function(e) {
      return window.location.hash = $(e.currentTarget).attr("href").substring(1);
    },
    show: function() {
      return this.$el.show();
    },
    hide: function() {
      return this.$el.hide();
    },
    fetch: function() {
      var _this = this;
      return this.model.fetch({
        success: function(r) {
          return _this.onFetch(r);
        }
      });
    },
    onFetch: function(r) {}
  });
});
