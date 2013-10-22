require.config({
  baseUrl: "/static/js",
  paths: {
    "jquery": "ext/jquery/jquery",
    "hotkeys": "ext/jquery/jquery.hotkeys",
    "moment": "ext/moment/moment.min",
    "underscore": "ext/underscore/underscore-min",
    "backbone": "ext/backbone/backbone-min",
    "bootstrap": "ext/bootstrap/bootstrap.min",
    "wysiwyg": "ext/bootstrap/bootstrap-wysiwyg",
    "prettify": "ext/google/prettify",
    "template": "ext/jquery/template",
    "form": "ext/jquery/jquery.form.min",
    "main-view": "views/CBUMainView",
    "discover-view": "views/CBUDiscoverView",
    "project-view": "views/CBUProjectView",
    "project-owner-view": "views/CBUProjectOwnerView",
    "login-view": "views/CBULoginView",
    "signup-view": "views/CBUSignupView",
    "create-view": "views/partials-universal/CreateProjectView",
    "abstract-view": "views/partials-universal/AbstractView",
    "project-sub-view": "views/partials-project/ProjectSubView",
    "user-view": "views/partials-user/CBUUserView",
    "profile-view": "views/CBUProfileView",
    "utils": "utils/Utils"
  }
});

require(["jquery", "main-view", "backbone", "discover-view", "create-view", "project-view", "project-owner-view", "login-view", "signup-view", "user-view", "profile-view", "utils"], function($, CBUMainView, Backbone, CBUDiscoverView, CreateProjectView, CBUProjectView, CBUProjectOwnerView, CBULoginView, CBUSignupView, CBUUserView, CBUProfileView, Utils) {
  $(document).ready(function() {
    var CBUAppRouter, CBURouter, config;
    config = {
      parent: "#frame"
    };
    CBURouter = Backbone.Router.extend({
      routes: {
        "project/:id": "project",
        "user/:id": "user",
        "discover": "discover",
        "create": "create",
        "login": "login",
        "signup": "signup",
        "project": "project",
        "profile": "profile",
        "": "default"
      },
      project: function(id_) {
        config.model = {
          id: id_
        };
        console.log('CBURouter', config);
        return window.CBUAppView = userID === projectOwnerID ? new CBUProjectOwnerView(config) : new CBUProjectView(config);
      },
      user: function(id_) {
        config.model = {
          id: id_
        };
        return window.CBUAppView = new CBUUserView(config);
      },
      discover: function() {
        return window.CBUAppView = new CBUDiscoverView(config);
      },
      create: function() {
        return window.CBUAppView = new CreateProjectView(config);
      },
      login: function() {
        return window.CBUAppView = new CBULoginView(config);
      },
      signup: function() {
        return window.CBUAppView = new CBUSignupView(config);
      },
      profile: function() {
        return window.CBUAppView = new CBUProfileView(config);
      },
      "default": function() {
        return window.CBUAppView = new CBUMainView(config);
      }
    });
    CBUAppRouter = new CBURouter();
    return Backbone.history.start({
      pushState: true
    });
  });
  /* GLOBAL UTILS*/

  return window.popWindow = function(url) {
    var h, left, title, top, w;
    title = "social";
    w = 650;
    h = 650;
    left = (screen.width / 2) - (w / 2);
    top = (screen.height / 2) - (h / 2);
    return window.open(url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" + w + ", height=" + h + ", top=" + top + ", left=+" + left);
  };
});
