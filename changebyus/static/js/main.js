require.config({
  baseUrl: "/static/js",
  paths: {
    "jquery": "ext/jquery/jquery",
    "hotkeys": "ext/jquery/jquery.hotkeys",
    "moment": "ext/moment/moment.min",
    "underscore": "ext/underscore/underscore-min",
    "backbone": "ext/backbone/backbone-min",
    "bootstrap": "ext/bootstrap/bootstrap.min",
    "bootstrap-fileupload": "ext/bootstrap/bootstrap-fileupload",
    "button": "ext/jquery/jquery.screwdefaultbuttonsV2.min",
    "dropkick": "ext/jquery/jquery.dropkick-min",
    "hogan": "ext/hogan/hogan-2.0.0.amd",
    "wysiwyg": "ext/bootstrap/bootstrap-wysiwyg",
    "autocomp": "ext/bootstrap/typeahead.min",
    "prettify": "ext/google/prettify",
    "template": "ext/jquery/template",
    "form": "ext/jquery/jquery.form.min",
    "validate": "ext/jquery/jquery.validate.min",
    "main-view": "views/CBUMainView",
    "discover-view": "views/CBUDiscoverView",
    "project-view": "views/CBUProjectView",
    "project-owner-view": "views/CBUProjectOwnerView",
    "login-view": "views/CBULoginView",
    "signup-view": "views/CBUSignupView",
    "create-view": "views/partials-project/ProjectCreateView",
    "abstract-view": "views/partials-universal/AbstractView",
    "project-sub-view": "views/partials-project/ProjectSubView",
    "resource-project-view": "views/partials-universal/ResourceProjectPreviewView",
    "user-view": "views/CBUUserView",
    "dashboard-view": "views/CBUDashboardView",
    "stream-view": "views/CBUStreamView",
    "utils": "utils/Utils"
  }
});

require(["jquery", "backbone", "main-view", "discover-view", "project-view", "project-owner-view", "login-view", "signup-view", "user-view", "dashboard-view", "stream-view", "create-view", "utils"], function($, Backbone, CBUMainView, CBUDiscoverView, CBUProjectView, CBUProjectOwnerView, CBULoginView, CBUSignupView, CBUUserView, CBUDashboardView, CBUStreamView, ProjectCreateView, Utils) {
  $(document).ready(function() {
    var $footer, $navTop, $window, CBUAppRouter, CBURouter, config, footerHeight, isOwner;
    config = {
      parent: "#frame"
    };
    isOwner = userID === projectOwnerID;
    CBURouter = Backbone.Router.extend({
      routes: {
        "project/:id": "project",
        "project/:id/admin": "projectAdmin",
        "user/:id": "user",
        "discover": "discover",
        "stream/dashboard": "dashboard",
        "create": "create",
        "login": "login",
        "signup": "signup",
        "project": "project",
        "stream": "stream",
        "stream/": "stream",
        "": "default"
      },
      project: function(id_) {
        config.model = {
          id: id_
        };
        config.isOwner = isOwner;
        return window.CBUAppView = new CBUProjectView(config);
      },
      projectAdmin: function(id_) {
        config.model = {
          id: id_
        };
        config.isOwner = isOwner;
        window.CBUAppView = isOwner ? new CBUProjectOwnerView(config) : new CBUProjectView(config);
        return console.log('admin', window.CBUAppView, isOwner);
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
      dashboard: function() {
        config.model = {
          id: window.userID
        };
        return window.CBUAppView = new CBUDashboardView(config);
      },
      create: function() {
        return window.CBUAppView = new ProjectCreateView(config);
      },
      login: function() {
        return window.CBUAppView = new CBULoginView(config);
      },
      signup: function() {
        return window.CBUAppView = new CBUSignupView(config);
      },
      stream: function() {
        return window.CBUAppView = new CBUStreamView(config);
      },
      "default": function() {
        return window.CBUAppView = new CBUMainView(config);
      }
    });
    CBUAppRouter = new CBURouter();
    Backbone.history.start({
      pushState: true
    });
    /* NAV*/

    $navTop = $('.nav.pull-left');
    $navTop.hover(function() {
      return $(this).toggleClass('active');
    }, function() {
      return $(this).removeClass('active');
    });
    /* LOG OUT*/

    $("a[href='/logout']").click(function(e) {
      var _this = this;
      e.preventDefault();
      return $.ajax({
        type: "GET",
        url: "/logout"
      }).done(function(response) {
        return window.location.reload();
      });
    });
    /* STICKY FOOTER*/

    $window = $(window);
    footerHeight = 0;
    $footer = $(".footer-nav");
    window.positionFooter = function() {
      footerHeight = parseInt($footer.height()) + parseInt($footer.css('margin-top'));
      console.log($footer.css('margin-top'), footerHeight);
      if (($(document.body).height() + footerHeight) < $window.height()) {
        return $footer.css({
          position: "fixed",
          bottom: 0
        });
      } else {
        return $footer.css({
          position: "relative"
        });
      }
    };
    positionFooter();
    $window.scroll(positionFooter).resize(positionFooter);
    return window.onPageElementsLoad = function() {
      console.log('onPageElementsLoad');
      return positionFooter();
    };
    /* END STICKY FOOTER*/

  });
  /* GLOBAL UTILS*/

  window.popWindow = function(url) {
    var h, left, title, top, w;
    title = "social";
    w = 650;
    h = 650;
    left = (screen.width / 2) - (w / 2);
    top = (screen.height / 2) - (h / 2);
    return window.open(url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" + w + ", height=" + h + ", top=" + top + ", left=+" + left);
  };
  return window.delay = function(time, fn) {
    return setTimeout(fn, time);
  };
});
