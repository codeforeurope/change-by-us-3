define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var BannerSearchView;
  BannerSearchView = AbstractView.extend({
    initialize: function(options) {
      AbstractView.prototype.initialize.apply(this, options);
      return this.render();
    },
    render: function() {
      this.$el = $("<div class='banner-search'/>");
      this.$el.template(this.templateDir + "/templates/partials-discover/banner-search.html", {
        data: this.viewData
      }, function() {});
      return $(this.parent).append(this.$el);
    }
  });
  return BannerSearchView;
});
