define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
  var CBUSignupView;
  return CBUSignupView = Backbone.View.extend({
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
      this.$el = $("<div class='signup'/>");
      this.$el.template(this.templateDir + "/templates/signup.html", {
        data: this.viewData
      }, function() {
        _this.ajaxForm();
        return _this.addListeners();
      });
      return $(this.parent).append(this.$el);
    },
    addListeners: function() {
      var _this = this;
      $(".btn-info").click(function(e) {
        var url;
        e.preventDefault();
        url = $(this).attr("href");
        return popWindow(url);
      });
      $(window).bind("hashchange", function(e) {
        return _this.toggleSubView();
      });
      return this.toggleSubView();
    },
    ajaxForm: function() {
      var $feedback, $signin, $submit, options,
        _this = this;
      $signin = $("form[name='signin']");
      $submit = $("input[type='submit']");
      $feedback = $("#login-feedback");
      options = {
        beforeSubmit: function() {
          console.log('beforeSubmit');
          $form.find("input, textarea").attr("disabled", "disabled");
          return $feedback.removeClass("alert").html("");
        },
        success: function(response) {
          $form.find("input, textarea").removeAttr("disabled");
          if (response.msg.toLowerCase() === "ok") {
            return window.location.href = "/";
          } else {
            return $feedback.addClass("alert").html(response.msg);
          }
        }
      };
      return $signin.ajaxForm(options);
    },
    toggleSubView: function() {
      var view;
      view = window.location.hash.substring(1);
      if (view === "facebook") {
        $('.facebook-signup').show();
        return $('.init-signup').hide();
      } else {
        $('.facebook-signup').hide();
        return $('.init-signup').show();
      }
    }
  });
});
