require.config
  baseUrl: "/static/js"
  paths:
    "jquery": "ext/jquery/jquery"
    "hotkeys": "ext/jquery/jquery.hotkeys"
    "underscore": "ext/underscore/underscore-min"
    "backbone": "ext/backbone/backbone-min"
    "bootstrap": "ext/bootstrap/bootstrap.min"
    "wysiwyg": "ext/bootstrap/bootstrap-wysiwyg"
    "prettify": "ext/google/prettify"
    "template": "ext/jquery/template"
    "form": "ext/jquery/jquery.form.min"
    "main-view": "views/CBUMainView"
    "discover-view": "views/CBUDiscoverView"
    "project-view": "views/CBUProjectView"
    "login-view": "views/CBULoginView"
    "signup-view": "views/CBUSignupView"
    "create-view": "views/partials-universal/CreateProjectView"
    "abstract-view": "views/partials-universal/AbstractView"
    "project-sub-view": "views/partials-project/ProjectSubView"
    "user-view": "views/partials-user/CBUUserView"
 
require ["jquery", "main-view", "backbone", "discover-view", "create-view", "project-view", "login-view", "signup-view", "user-view"], 
  ($, CBUMainView, Backbone, CBUDiscoverView, CreateProjectView, CBUProjectView, CBULoginView, CBUSignupView, CBUUserView) ->
    $(document).ready ->
      config = parent: "#frame"
      CBURouter = Backbone.Router.extend(
        routes:
          "project/:id": "project"
          "user/:id": "user"
          discover: "discover"
          create: "create"
          login: "login"
          signup: "signup"
          project: "project"
          "": "default"

        project: (id) ->
          config.model = id: id
          window.CBUAppView = new CBUProjectView(config)

        user: (id) ->
          config.model = id: id
          window.CBUAppView = new CBUUserView(config)

        discover: ->
          window.CBUAppView = new CBUDiscoverView(config)

        create: ->
          window.CBUAppView = new CreateProjectView(config)

        login: ->
          window.CBUAppView = new CBULoginView(config)

        signup: ->
          window.CBUAppView = new CBUSignupView(config)

        default: ->
          
          # added in dev tool
          window.CBUAppView = new CBUMainView(config)
      )
      CBUAppRouter = new CBURouter()
      Backbone.history.start pushState: true

