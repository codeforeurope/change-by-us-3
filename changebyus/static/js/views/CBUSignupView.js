define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
  var CBUSignupView, popWindow;
  popWindow = function(url) {
    var h, left, title, top, w;
    title = "social";
    w = 650;
    h = 650;
    left = (screen.width / 2) - (w / 2);
    top = (screen.height / 2) - (h / 2);
    return window.open(url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" + w + ", height=" + h + ", top=" + top + ", left=" + left);
  };
  CBUSignupView = Backbone.View.extend({
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
      var self;
      self = this;
      this.$el = $("<div class='signup'/>");
      this.$el.template(this.templateDir + "/templates/signup.html", {
        data: this.viewData
      }, function() {
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
      var $signin;
      $signin = $("form[name=signin]");
      return $signin.ajaxForm(function(response) {
        return console.log(response);
      });
    }
  });
  return CBUSignupView;
});
