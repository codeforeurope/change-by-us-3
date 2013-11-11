require.config
	baseUrl: "/static/js"
	paths:
		"jquery": "ext/jquery/jquery"
		"hotkeys": "ext/jquery/jquery.hotkeys" 
		"moment": "ext/moment/moment.min"
		"underscore": "ext/underscore/underscore-min"
		"backbone": "ext/backbone/backbone-min"
		"bootstrap": "ext/bootstrap/bootstrap.min"
		"dropkick": "ext/jquery/jquery.dropkick-min"
		"hogan": "ext/hogan/hogan-2.0.0.amd"
		"wysiwyg": "ext/bootstrap/bootstrap-wysiwyg"
		"autocomp": "ext/bootstrap/typeahead.min"
		"prettify": "ext/google/prettify"
		"template": "ext/jquery/template"
		"form": "ext/jquery/jquery.form.min"
		"validate": "ext/jquery/jquery.validate.min"
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
		"dashboard-view": "views/CBUDashboardView"
		"utils": "utils/Utils"

require ["jquery", 
		 "main-view", 
		 "backbone", 
		 "discover-view", 
		 "create-view", 
		 "project-view", 
		 "project-owner-view", 
		 "login-view", 
		 "signup-view", 
		 "user-view", 
		 "dashboard-view", 
		 "utils"], 
	($, 
	 CBUMainView, 
	 Backbone, 
	 CBUDiscoverView, 
	 CreateProjectView, 
	 CBUProjectView, 
	 CBUProjectOwnerView, 
	 CBULoginView, 
	 CBUSignupView, 
	 CBUUserView, 
	 CBUDashboardView, 
	 Utils) ->
		$(document).ready ->
			config = parent: "#frame"
			CBURouter = Backbone.Router.extend
				routes:
					"project/:id": "project"
					"project/:id/admin": "projectAdmin"
					"user/:id": "user"
					"discover": "discover"
					"stream/dashboard": "dashboard"
					"create": "create"
					"login": "login"
					"signup": "signup"
					"project": "project" 
					"": "default"

				project: (id_) ->
					config.model = {id:id_, isOwner:(userID is projectOwnerID)} 
					window.CBUAppView =  new CBUProjectView(config)

				projectAdmin: (id_) ->
					config.model = {id:id_}
					window.CBUAppView = if (userID is projectOwnerID) then (new CBUProjectOwnerView(config)) else (new CBUProjectView(config))
					console.log 'admin',window.CBUAppView,(userID is projectOwnerID)

				user: (id_) ->
					config.model = {id:id_}
					window.CBUAppView = new CBUUserView(config)

				discover: ->
					window.CBUAppView = new CBUDiscoverView(config)

				dashboard: ->
					config.model = {id:window.userID}
					window.CBUAppView = new CBUDashboardView(config) 

				create: ->
					window.CBUAppView = new CreateProjectView(config)

				login: ->
					window.CBUAppView = new CBULoginView(config)

				signup: ->
					window.CBUAppView = new CBUSignupView(config)

				default: ->
					# added in dev tool
					window.CBUAppView = new CBUMainView(config)

			CBUAppRouter = new CBURouter()
			Backbone.history.start pushState: true

			# NAV
			$navTop = $('.nav.pull-left')
			$navTop.hover ->
				$(this).toggleClass('active')
			, ->
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
