require.config
	baseUrl: "/static/js"
	paths:
		"jquery": "ext/jquery/jquery"
		"hotkeys": "ext/jquery/jquery.hotkeys" 
		"moment": "ext/moment/moment.min"
		"underscore": "ext/underscore/underscore-min"
		"backbone": "ext/backbone/backbone-min"
		"bootstrap": "ext/bootstrap/bootstrap.min"
		"hogan": "ext/hogan/hogan-2.0.0.amd"
		"wysiwyg": "ext/bootstrap/bootstrap-wysiwyg"
		"autocomp": "ext/bootstrap/typeahead.min"
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

			# NAV
			$navTop = $('.nav.pull-left')
			$navTop.mouseover ->
				$(this).toggleClass('active')
			$navTop.mouseout ->
				$(this).removeClass('active')


		### GLOBAL UTILS ###
		window.popWindow = (url) ->
			title = "social"
			w = 650
			h = 650
			left = (screen.width / 2) - (w / 2)
			top = (screen.height / 2) - (h / 2)
			window.open url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=#{w}, height=#{h}, top=#{top}, left=+#{left}"

		window.delay = (time, fn) ->
			setTimeout fn, time
