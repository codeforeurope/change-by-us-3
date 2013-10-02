define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
  var CBUDLoginView, popWindow;
  popWindow = function(url) {
    var h, left, title, top, w;
    title = "social";
    w = 650;
    h = 650;
    left = (screen.width / 2) - (w / 2);
    top = (screen.height / 2) - (h / 2);
    return window.open(url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" + w + ", height=" + h + ", top=" + top + ", left=" + left);
  };
  CBUDLoginView = Backbone.View.extend({
    parent: "body",
    templateDir: "/static",
    viewData: {},
    $submit: null,
    initialize: function(options) {
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.viewData = options.viewData || this.viewData;
      return this.render();
    },
    render: function() {
      var self;
      self = this;
      this.$el = $("<div class='login'/>");
      this.$el.template(this.templateDir + "/templates/login.html", {
        data: this.viewData
      }, function() {
        self.$submit = $("input[type=\"submit\"]");
        self.ajaxForm();
        return self.addListeners();
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
      var $feedback, $login, options, self;
      self = this;
      $login = $("form[name=signin]");
      $feedback = $("#login-feedback");
      options = {
        beforeSubmit: function() {
          self.$submit.prop("disabled", true);
          return $feedback.removeClass("alert").html("");
        },
        success: function(response) {
          self.$submit.prop("disabled", false);
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
  return CBUDLoginView;
});
