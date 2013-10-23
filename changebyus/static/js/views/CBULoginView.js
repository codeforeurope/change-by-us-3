define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
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
        return _this.addListeners();
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
      var $feedback, $login, $submit, options,
        _this = this;
      $submit = $("input[type='submit']");
      $login = $("form[name='signin']");
      $feedback = $("#login-feedback");
      options = {
        beforeSubmit: function() {
          $submit.prop("disabled", true);
          return $feedback.removeClass("alert").html("");
        },
        success: function(response) {
          $submit.prop("disabled", false);
          if (response.msg.toLowerCase() === "ok") {
            return window.location.href = "/";
          } else {
            return $feedback.addClass("alert").html(response.msg);
          }
        }
      };
      return $login.ajaxForm(options);
    }
  });
});
