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
    "login-view": "views/CBULoginView",
    "signup-view": "views/CBUSignupView",
    "create-view": "views/partials-universal/CreateProjectView",
    "abstract-view": "views/partials-universal/AbstractView",
    "project-sub-view": "views/partials-project/ProjectSubView",
    "user-view": "views/partials-user/CBUUserView",
    "utils": "utils/Utils"
  }
});

require(["jquery", "main-view", "backbone", "discover-view", "create-view", "project-view", "login-view", "signup-view", "user-view", "utils"], function($, CBUMainView, Backbone, CBUDiscoverView, CreateProjectView, CBUProjectView, CBULoginView, CBUSignupView, CBUUserView, Utils) {
  return $(document).ready(function() {
    var CBUAppRouter, CBURouter, config;
    config = {
      parent: "#frame"
    };
    CBURouter = Backbone.Router.extend({
      routes: {
        "project/:id": "project",
        "user/:id": "user",
        discover: "discover",
        create: "create",
        login: "login",
        signup: "signup",
        project: "project",
        "": "default"
      },
      project: function(id) {
        config.model = {
          id: id
        };
        return window.CBUAppView = new CBUProjectView(config);
      },
      user: function(id) {
        config.model = {
          id: id
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
      "default": function() {
        return window.CBUAppView = new CBUMainView(config);
      }
    });
    CBUAppRouter = new CBURouter();
    return Backbone.history.start({
      pushState: true
    });
  });
});
