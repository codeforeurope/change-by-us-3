define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var AbstractModalView;
  return AbstractModalView = AbstractView.extend({
    parent: 'body',
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    onTemplateLoad: function() {
      var _this = this;
      $('#page-wrapper').addClass('blur');
      this.$el.find(".close-x").click(function() {
        return _this.fadeOut();
      });
      return delay(10, function() {
        return $('.scaled-fade').removeClass('scaled-fade');
      });
    },
    fadeOut: function() {
      var _this = this;
      $('#page-wrapper').removeClass('blur');
      $('.success-modal, .embed-modal').addClass('scaled-fade');
      return $('.modal-fullscreen').fadeOut(500, function() {
        return _this.$el.remove();
      });
    }
  });
});
