define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var BannerImageView;
  return BannerImageView = AbstractView.extend({
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      this.$el = $("<div class='banner-image'/>");
      this.$el.template(this.templateDir + "/templates/partials-homepage/banner-image.html", {
        data: this.viewData
      }, function() {});
      return $(this.parent).append(this.$el);
    }
  });
});
