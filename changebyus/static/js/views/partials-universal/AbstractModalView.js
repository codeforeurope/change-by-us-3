define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var AbstractModalView;
  return AbstractModalView = AbstractView.extend({
    parent: 'body',
    initialize: function(options_) {
      $('body').css('overflow', 'hidden');
      AbstractView.prototype.initialize.call(this, options_);
      return this.render();
    },
    events: {
      "click .close-x": "fadeOut"
    },
    onTemplateLoad: function() {
      $('#page-wrapper').addClass('blur');
      return delay(10, function() {
        return $('.scaled-fade').removeClass('scaled-fade');
      });
    },
    fadeOut: function() {
      var _this = this;
      $('body').css('overflow', 'auto');
      $('#page-wrapper').removeClass('blur');
      $('.success-modal, .embed-modal, .donate-modal').addClass('scaled-fade');
      return $('.modal-fullscreen').fadeOut(500, function() {
        return _this.$el.remove();
      });
    }
  });
});
