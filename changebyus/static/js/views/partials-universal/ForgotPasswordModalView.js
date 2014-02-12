define(["underscore", "backbone", "jquery", "template", "abstract-modal-view"], function(_, Backbone, $, temp, AbstractModalView) {
  var ForgotPasswordModalView;
  return ForgotPasswordModalView = AbstractModalView.extend({
    render: function() {
      var _this = this;
      this.$el = $("<div class='modal-fullscreen dark'/>");
      this.$el.template("/reset", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    }
  });
});
