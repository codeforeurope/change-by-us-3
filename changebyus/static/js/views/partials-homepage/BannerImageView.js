define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var BannerImageView;
  return BannerImageView = AbstractView.extend({
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='banner-image'/>");
      this.$el.template(this.templateDir + "/templates/partials-homepage/banner-image.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    }
  });
});
