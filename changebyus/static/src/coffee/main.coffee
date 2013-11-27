require.config
	baseUrl: "/static/js"
	paths: 
		"jquery": "ext/jquery/jquery"
		"hotkeys": "ext/jquery/jquery.hotkeys" 
		"moment": "ext/moment/moment.min"
		"underscore": "ext/underscore/underscore-min"
		"backbone": "ext/backbone/backbone-min"
		"bootstrap": "ext/bootstrap/bootstrap.min"
		"bootstrap-fileupload": "ext/bootstrap/bootstrap-fileupload"
		"button": "ext/jquery/jquery.screwdefaultbuttonsV2.min"
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
		"create-view": "views/partials-project/ProjectCreateView"
		"abstract-view": "views/partials-universal/AbstractView"
		"project-sub-view": "views/partials-project/ProjectSubView"
		"resource-project-view": "views/partials-universal/ResourceProjectPreviewView"
		"user-view": "views/CBUUserView"
		"dashboard-view": "views/CBUDashboardView"
		"stream-view": "views/CBUStreamView"

require ["jquery", 
		"backbone", 
		 "main-view", 
		 "discover-view",  
		 "project-view", 
		 "project-owner-view", 
		 "login-view", 
		 "signup-view", 
		 "user-view", 
		 "dashboard-view", 
		 "stream-view",
		 "create-view"], 
	($, 
	 Backbone, 
	 CBUMainView, 
	 CBUDiscoverView,  
	 CBUProjectView, 
	 CBUProjectOwnerView, 
	 CBULoginView, 
	 CBUSignupView, 
	 CBUUserView, 
	 CBUDashboardView, 
	 CBUStreamView,
	 ProjectCreateView) ->
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
					"stream": "stream" 
					"stream/": "stream" 
					"": "default"

				project: (id_) ->
					config.model = {id:id_} 
					config.isOwner = (userID is projectOwnerID)
					window.CBUAppView =  new CBUProjectView(config)

				projectAdmin: (id_) ->
					isOwner = (userID is projectOwnerID)
					config.model = {id:id_}
					config.isOwner = isOwner
					window.CBUAppView = if (isOwner) then (new CBUProjectOwnerView(config)) else (new CBUProjectView(config))

				user: (id_) ->
					config.model = {id:id_}
					window.CBUAppView = new CBUUserView(config)

				discover: ->
					window.CBUAppView = new CBUDiscoverView(config)

				dashboard: ->
					config.model = {id:window.userID}
					window.CBUAppView = new CBUDashboardView(config) 

				create: ->
					window.CBUAppView = new ProjectCreateView(config)

				login: ->
					window.CBUAppView = new CBULoginView(config)

				signup: ->
					window.CBUAppView = new CBUSignupView(config)

				stream:->
					window.CBUAppView = new CBUStreamView(config)

				default: ->
					# added in dev tool
					window.CBUAppView = new CBUMainView(config)

			CBUAppRouter = new CBURouter()
			Backbone.history.start pushState: true

			### NAV ###
			$navTop = $('.nav.pull-left')
			$navTop.hover ->
				$(this).toggleClass('active')
			, ->
				$(this).removeClass('active')

			### LOG OUT ###
			$("a[href='/logout']").click (e)->
				e.preventDefault()
				$.ajax(
					type: "GET"
					url: "/logout" 
				).done (response)=> 
					window.location.reload()

			### STICKY FOOTER ###
			$window      = $(window)
			footerHeight = 0 
			$footer      = $(".footer-nav")

			window.positionFooter = ->
				footerHeight = parseInt($footer.height()) +  parseInt($footer.css('margin-top'))
				console.log $footer.css('margin-top'), footerHeight

				if ($(document.body).height() + footerHeight) < $window.height()
					$footer.css
						position: "fixed" 
						bottom: 0
				else
					$footer.css position: "relative"
			
			positionFooter()
			$window.scroll(positionFooter).resize(positionFooter)

			window.onPageElementsLoad = ->
				console.log 'onPageElementsLoad'
				positionFooter()
			### END STICKY FOOTER ###


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