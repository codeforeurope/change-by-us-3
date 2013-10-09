require.config
  baseUrl: "/static/js"
  paths:
    "jquery": "ext/jquery/jquery"
    "hotkeys": "ext/jquery/jquery.hotkeys" 
    "moment": "ext/moment/moment.min"
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
    "project-owner-view": "views/CBUProjectOwnerView"
    "login-view": "views/CBULoginView"
    "signup-view": "views/CBUSignupView"
    "create-view": "views/partials-universal/CreateProjectView"
    "abstract-view": "views/partials-universal/AbstractView"
    "project-sub-view": "views/partials-project/ProjectSubView"
    "user-view": "views/partials-user/CBUUserView"
    "profile-view": "views/CBUProfileView"
    "utils": "utils/Utils"
 
require ["jquery", "main-view", "backbone", "discover-view", "create-view", "project-view", "project-owner-view", "login-view", "signup-view", "user-view", "profile-view", "utils"], 
  ($, CBUMainView, Backbone, CBUDiscoverView, CreateProjectView, CBUProjectView, CBUProjectOwnerView, CBULoginView, CBUSignupView, CBUUserView, CBUProfileView, Utils) ->
    $(document).ready ->
      config = parent: "#frame"
      CBURouter = Backbone.Router.extend(
        routes:
          "project/:id": "project"
          "user/:id": "user"
          "discover": "discover"
          "create": "create"
          "login": "login"
          "signup": "signup"
          "project": "project"
          "profile": "profile"
          "": "default"

        project: (id_) ->
          config.model = {id:id_}
          console.log 'CBURouter',config
          window.CBUAppView = if (userID is projectOwnerID) then (new CBUProjectOwnerView(config)) else (new CBUProjectView(config))

        user: (id_) ->
          config.model = {id:id_}
          window.CBUAppView = new CBUUserView(config)

        discover: ->
          window.CBUAppView = new CBUDiscoverView(config)

        create: ->
          window.CBUAppView = new CreateProjectView(config)

        login: ->
          window.CBUAppView = new CBULoginView(config)

        signup: ->
          window.CBUAppView = new CBUSignupView(config)

        profile: ->
          window.CBUAppView = new CBUProfileView(config)

        default: ->
          # added in dev tool
          window.CBUAppView = new CBUMainView(config)
      )
      CBUAppRouter = new CBURouter()
      Backbone.history.start pushState: true

