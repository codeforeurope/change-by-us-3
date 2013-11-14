define(["underscore", "backbone", "jquery", "template", "validate"], function(_, Backbone, $, temp, valid) {
  var CBUDLoginView;
  return CBUDLoginView = Backbone.View.extend({
    parent: "body",
    templateDir: "/static",
    viewData: {},
    initialize: function(options) {
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.viewData = options.viewData || this.viewData;
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
