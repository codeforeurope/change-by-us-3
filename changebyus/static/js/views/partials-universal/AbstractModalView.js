define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var AbstractModalView;
  return AbstractModalView = AbstractView.extend({
    parent: 'body',
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      $('body').css('overflow', 'hidden');
      return this.render();
    },
    events: {
      "click .close-x": "fadeOut"
    },
    onTemplateLoad: function() {
      var _this = this;
      $('#page-wrapper').addClass('blur');
      delay(10, function() {
        return $('.scaled-fade').removeClass('scaled-fade');
      });
      this.$el.click(function(e) {
        return _this.backClick(e);
      });
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    fadeOut: function() {
      var _this = this;
      $('body').css('overflow', 'auto');
      $('#page-wrapper').removeClass('blur');
      $('.success-modal, .embed-modal, .donate-modal').addClass('scaled-fade');
      return $('.modal-fullscreen').fadeOut(500, function() {
        return _this.$el.remove();
      });
    },
    backClick: function(e) {
      if ($(e.target).hasClass('modal-fullscreen')) {
        return this.fadeOut();
      }
    }
  });
});
