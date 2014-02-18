define(["underscore", "backbone", "jquery", "template", "validate", "abstract-view", "views/partials-universal/ForgotPasswordModalView"], function(_, Backbone, $, temp, valid, AbstractView, ForgotPasswordModalView) {
  var CBUDLoginView;
  return CBUDLoginView = AbstractView.extend({
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      return this.render();
    },
    events: {
      "click .btn-info": "popUp",
      "click #forgot-password": "forgotPassword"
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='login'/>");
      this.$el.template(this.templateDir + "/templates/login.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      AbstractView.prototype.onTemplateLoad.call(this);
      this.ajaxForm();
      return onPageElementsLoad();
    },
    popUp: function(e) {
      var url;
      e.preventDefault();
      url = $(e.currentTarget).attr("href");
      return popWindow(url);
    },
    forgotPassword: function(e) {
      var forgotPasswordModalView;
      e.preventDefault();
      return forgotPasswordModalView = new ForgotPasswordModalView();
    },
    ajaxForm: function() {
      var $feedback, $form, $submit, options,
        _this = this;
      $submit = $("input[type='submit']");
      $form = $("form");
      $feedback = $(".login-feedback");
      options = {
        type: $form.attr('method'),
        url: $form.attr('action'),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function() {
          if ($form.valid()) {
            $form.find("input, textarea").attr("disabled", "disabled");
            $feedback.removeClass("alert").removeClass("alert-danger").html("");
            return true;
          } else {
            return false;
          }
        },
        success: function(response_) {
          $form.find("input, textarea").removeAttr("disabled");
          if (response_.success) {
            return window.location.href = "/stream/dashboard";
          } else {
            return $feedback.addClass("alert").addClass("alert-danger").html(response_.msg);
          }
        }
      };
      return $form.submit(function() {
        var json_str;
        json_str = JSON.stringify($form.serializeJSON());
        options.data = json_str;
        $.ajax(options);
        return false;
      });
    }
  });
});
