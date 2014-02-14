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
    },
    onTemplateLoad: function() {
      AbstractModalView.prototype.onTemplateLoad.call(this);
      return this.ajaxForm();
    },
    ajaxForm: function() {
      var $form, $inputs, options, self;
      self = this;
      $form = $("form[name=forgot_password_form]");
      $inputs = $form.find("input, textarea");
      options = {
        type: $form.attr('method'),
        url: $form.attr('action'),
        beforeSubmit: function(arr_, form_, options_) {
          if ($form.valid()) {
            $inputs.attr("disabled", "disabled");
            return true;
          } else {
            return false;
          }
        },
        success: function(res) {
          self.$el.html(res);
          return self.onTemplateLoad();
        }
      };
      return $form.ajaxForm(options);
    }
  });
});
