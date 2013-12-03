define(["underscore", "backbone", "jquery", "template", "validate", "abstract-view"], function(_, Backbone, $, temp, valid, AbstractView) {
  var CBUDLoginView;
  return CBUDLoginView = AbstractView.extend({
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='login'/>");
      this.$el.template(this.templateDir + "/templates/login.html", {
        data: this.viewData
      }, function() {
        _this.ajaxForm();
        _this.addListeners();
        return onPageElementsLoad();
      });
      return $(this.parent).append(this.$el);
    },
    addListeners: function() {
      return $(".btn-info").click(function(e) {
        var url;
        e.preventDefault();
        url = $(this).attr("href");
        return popWindow(url);
      });
    },
    ajaxForm: function() {
      var $feedback, $form, $login, $submit, options,
        _this = this;
      $submit = $("input[type='submit']");
      $form = $("form");
      $login = $("form[name='signin']");
      $feedback = $(".login-feedback");
      options = {
        beforeSubmit: function() {
          if ($form.valid()) {
            $form.find("input, textarea").attr("disabled", "disabled");
            $feedback.removeClass("alert").removeClass("alert-danger").html("");
            return true;
          } else {
            return false;
          }
        },
        success: function(response) {
          $form.find("input, textarea").removeAttr("disabled");
          if (response.msg.toLowerCase() === "ok") {
            return window.location.href = "/";
          } else {
            return $feedback.addClass("alert").addClass("alert-danger").html(response.msg);
          }
        }
      };
      return $login.ajaxForm(options);
    }
  });
});
