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
    "serializeObject": "ext/jquery/jquery.serializeObject.min",
    "serializeJSON": "ext/jquery/jquery.serializeJSON.min",
    "dropkick": "ext/jquery/jquery.dropkick-min",
    "slicknav": "ext/jquery/jquery.slicknav.min",
    "hogan": "ext/hogan/hogan-2.0.0.amd",
    "wysiwyg": "ext/bootstrap/bootstrap-wysiwyg",
    "autocomp": "ext/bootstrap/typeahead.min",
    "prettify": "ext/google/prettify",
    "template": "ext/jquery/template",
    "form": "ext/jquery/jquery.form.min",
    "validate": "ext/jquery/jquery.validate.min",
    "payment": "ext/jquery/jquery.payment",
    "main-view": "views/CBUMainView",
    "discover-view": "views/CBUDiscoverView",
    "city-view": "views/CBUCityView",
    "project-view": "views/CBUProjectView",
    "fundraising": "views/CBUFundraisingView",
    "project-owner-view": "views/CBUProjectOwnerView",
    "login-view": "views/CBULoginView",
    "signup-view": "views/CBUSignupView",
    "create-view": "views/partials-universal/CreateView",
    "abstract-view": "views/partials-universal/AbstractView",
    "abstract-modal-view": "views/partials-universal/AbstractModalView",
    "project-sub-view": "views/partials-project/ProjectSubView",
    "resource-project-view": "views/partials-universal/ResourceProjectPreviewView",
    "user-view": "views/CBUUserView",
    "dashboard-view": "views/CBUDashboardView",
    "stripe-edit": "views/CBUStripeEdit",
    "stream-view": "views/CBUStreamView",
    "admin-view": "views/CBUAdminView"
  },
  shim: {
    "slicknav": ["jquery"],
    "dropkick": ["jquery"],
    "button": ["jquery"],
    "bootstrap-fileupload": ["jquery", "bootstrap"],
    "autocomp": ["jquery", "bootstrap"],
    "wysiwyg": ["jquery", "bootstrap"],
    "hotkeys": ["jquery"],
    "form": ["jquery"],
    "template": ["jquery"],
    "validate": ["jquery"],
    "payment": ["jquery"],
    "serializeObject": ["jquery"],
    "serializeJSON": ["jquery"]
  }
});

define(["jquery", "backbone", "main-view", "discover-view", "city-view", "project-view", "project-owner-view", "login-view", "signup-view", "user-view", "dashboard-view", "stream-view", "admin-view", "create-view", "stripe-edit", "fundraising", "slicknav"], function($, Backbone, CBUMainView, CBUDiscoverView, CBUCityView, CBUProjectView, CBUProjectOwnerView, CBULoginView, CBUSignupView, CBUUserView, CBUDashboardView, CBUStreamView, CBUAdminView, CreateView, CBUStripeEdit, CBUFundraisingView, SlickNav) {
  return $(document).ready(function() {
    var $clone, $cloneLast, $footer, $mainContent, $navTop, $topnav, $window, CBUAppRouter, CBURouter, config, debounce, footerHeight;
    config = {
      parent: ".main-content"
    };
    CBURouter = Backbone.Router.extend({
      routes: {
        "project/:id": "project",
        "project/:id/admin": "projectAdmin",
        "project/:id/stripe/:sid/edit": "stripeEdit",
        "project/:id/fundraising": "fundraising",
        "resource/:id": "resource",
        "resource/:id/admin": "resourceAdmin",
        "city/:id": "city",
        "user/:id": "user",
        "discover": "discover",
        "stream/dashboard": "dashboard",
        "create/project": "createProject",
        "create/resource": "createResource",
        "login": "login",
        "signup": "signup",
        "project": "project",
        "stream": "stream",
        "stream/": "stream",
        "admin": "admin",
        "": "default"
      },
      project: function(id_) {
        config.model = {
          id: id_
        };
        config.isResource = false;
        config.isOwner = userID === projectOwnerID;
        return window.CBUAppView = new CBUProjectView(config);
      },
      projectAdmin: function(id_) {
        if (userID) {
          config.model = {
            id: id_
          };
          return window.CBUAppView = new CBUProjectOwnerView(config);
        } else {
          return window.location.href = "/login";
        }
      },
      stripeEdit: function(id_, sid_) {
        config.model = {
          id: id_,
          sid: sid_
        };
        return window.CBUAppView = new CBUStripeEdit(config);
      },
      fundraising: function(id_) {
        config.model = {
          id: id_
        };
        return window.CBUAppView = new CBUFundraisingView(config);
      },
      resource: function(id_) {
        config.model = {
          id: id_
        };
        config.isResource = true;
        return window.CBUAppView = new CBUProjectView(config);
      },
      resourceAdmin: function(id_) {
        if (userID) {
          config.model = {
            id: id_
          };
          config.isResource = true;
          return window.CBUAppView = new CBUProjectOwnerView(config);
        } else {
          return window.location.href = "/login";
        }
      },
      city: function(id_) {
        config.model = {
          id: id_
        };
        return window.CBUAppView = new CBUCityView(config);
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
      createProject: function() {
        config.isResource = false;
        return window.CBUAppView = new CreateView(config);
      },
      createResource: function() {
        config.isResource = true;
        return window.CBUAppView = new CreateView(config);
      },
      login: function() {
        return window.CBUAppView = new CBULoginView(config);
      },
      /*
      reset:(token) ->
          config.token = token
          window.CBUAppView = new CBULoginView(config)
      */

      signup: function() {
        return window.CBUAppView = new CBUSignupView(config);
      },
      stream: function() {
        return window.CBUAppView = new CBUStreamView(config);
      },
      admin: function() {
        return window.CBUAppView = new CBUAdminView(config);
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
    $('.nav.nav-pills.pull-right').slicknav({
      label: '',
      prependTo: '#responsive-menu'
    });
    $clone = $('.resp-append');
    $cloneLast = $('.resp-append-last');
    $clone.clone().appendTo($('.slicknav_nav'));
    $cloneLast.clone().appendTo($('.slicknav_nav'));
    $(".logged-in .user-avatar").click(function(e) {
      return window.location.href = "/stream/dashboard";
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
    /* GLOBAL UTILS ----------------------------------------------------------------------------------*/

    window.popWindow = function(url) {
      var h, left, title, top, w;
      w = 650;
      h = 650;
      left = (screen.width / 2) - (w / 2);
      top = (screen.height / 2) - (h / 2);
      title = "social";
      return window.open(url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" + w + ", height=" + h + ", top=" + top + ", left=+" + left);
    };
    window.delay = function(time, fn) {
      return setTimeout(fn, time);
    };
    window.randomInt = function(num_) {
      return Math.floor(Math.random() * num_);
    };
    window.arrayToListString = function(arr_) {
      var i, str, _i, _len;
      for (i = _i = 0, _len = arr_.length; _i < _len; i = ++_i) {
        str = arr_[i];
        arr_[i] = capitalize(str);
      }
      if (arr_.length <= 1) {
        str = arr_.join();
      } else {
        str = arr_.slice(0, -1).join(", ") + " and " + arr_[arr_.length - 1];
      }
      return str;
    };
    window.capitalize = function(str_) {
      var str;
      return str = str_.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };
    $(document).bind('keydown', function(e) {
      var c, k, _ref;
      if ((_ref = location.host) === "localhost:5000" || _ref === "localtunnel.com:5000") {
        c = e.keyCode ? e.keyCode : e.which;
        k = String.fromCharCode(c).toLowerCase();
        if (k === 'd') {
          return $('body').toggleClass('debug');
        }
      }
    });
    /* STICKY FOOTER ----------------------------------------------------------------------------------*/

    $window = $(window);
    $topnav = $(".top-nav");
    $mainContent = $(".main-content");
    $footer = $(".footer-nav");
    footerHeight = 0;
    debounce = null;
    window.positionFooter = function() {
      if (debounce) {
        clearTimeout(debounce);
      }
      return debounce = delay(10, function() {
        var mainContentHeight, topNavHeight;
        topNavHeight = $topnav.height();
        mainContentHeight = $mainContent.height();
        footerHeight = $footer.height() + 140;
        if ((topNavHeight + mainContentHeight + footerHeight) < $window.height()) {
          return $footer.css({
            position: "fixed"
          });
        } else {
          return $footer.css({
            position: "relative"
          });
        }
      });
    };
    positionFooter();
    $window.scroll(positionFooter).resize(positionFooter);
    return window.onPageElementsLoad = function() {
      return positionFooter();
    };
  });
});
