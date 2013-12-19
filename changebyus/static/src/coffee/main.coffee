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
		"serializeObject": "ext/jquery/jquery.serializeObject.min"
		"serializeJSON": "ext/jquery/jquery.serializeJSON.min"
		"dropkick": "ext/jquery/jquery.dropkick-min"
		"slicknav": "ext/jquery/jquery.slicknav.min"
		"hogan": "ext/hogan/hogan-2.0.0.amd"
		"wysiwyg": "ext/bootstrap/bootstrap-wysiwyg"
		"autocomp": "ext/bootstrap/typeahead.min"
		"prettify": "ext/google/prettify"
		"template": "ext/jquery/template"
		"form": "ext/jquery/jquery.form.min"
		"validate": "ext/jquery/jquery.validate.min"
		"main-view": "views/CBUMainView"
		"discover-view": "views/CBUDiscoverView"
		"city-view": "views/CBUCityView"
		"project-view": "views/CBUProjectView"
		"project-owner-view": "views/CBUProjectOwnerView"
		"login-view": "views/CBULoginView"
		"signup-view": "views/CBUSignupView"
		"create-view": "views/partials-universal/CreateView"
		"abstract-view": "views/partials-universal/AbstractView"
		"abstract-modal-view": "views/partials-universal/AbstractModalView"
		"project-sub-view": "views/partials-project/ProjectSubView"
		"resource-project-view": "views/partials-universal/ResourceProjectPreviewView"
		"user-view": "views/CBUUserView"
		"dashboard-view": "views/CBUDashboardView"
		"stream-view": "views/CBUStreamView"

	shim:
		"slicknav":["jquery"]
		"dropkick":["jquery"]
		"bootstrap-fileupload":["jquery", "bootstrap"]
		"autocomp":["jquery", "bootstrap"]
		"hotkeys":["jquery"]
		"form":["jquery"]
		"template":["jquery"]
		"validate":["jquery"]

define ["jquery",  
		"backbone", 
		 "main-view", 
		 "discover-view",  
		 "city-view", 
		 "project-view", 
		 "project-owner-view", 
		 "login-view", 
		 "signup-view", 
		 "user-view", 
		 "dashboard-view", 
		 "stream-view",
		 "create-view",
		 "slicknav"], 
	($, 
	 Backbone,
	 CBUMainView,
	 CBUDiscoverView,
	 CBUCityView,
	 CBUProjectView, 
	 CBUProjectOwnerView, 
	 CBULoginView, 
	 CBUSignupView, 
	 CBUUserView, 
	 CBUDashboardView, 
	 CBUStreamView,
	 CreateView,
	 SlickNav) ->
		$(document).ready ->
			config = {parent:".main-content"}

			CBURouter = Backbone.Router.extend
				routes:
					"project/:id": "project"
					"project/:id/admin": "projectAdmin"
					"resource/:id": "resource"
					"city/:id": "city"
					"user/:id": "user"
					"discover": "discover"
					"stream/dashboard": "dashboard"
					"create/project": "createProject"
					"create/resource": "createResource"
					"login": "login"
					"signup": "signup"
					"project": "project" 
					"stream": "stream" 
					"stream/": "stream" 
					"": "default"

				project: (id_) ->
					config.model = {id:id_} 
					config.isResource = false
					config.isOwner = (userID is projectOwnerID)
					window.CBUAppView =  new CBUProjectView(config)

				projectAdmin: (id_) ->
					isOwner = (userID is projectOwnerID)
					config.model = {id:id_}
					config.isOwner = isOwner
					window.CBUAppView = if (isOwner) then (new CBUProjectOwnerView(config)) else (new CBUProjectView(config))

				resource: (id_) ->
					config.model = {id:id_}
					config.isResource = true
					window.CBUAppView =  new CBUProjectView(config)

				city: (id_) -> 
					config.model = {id:id_}
					window.CBUAppView =  new CBUCityView(config)

				user: (id_) ->
					config.model = {id:id_}
					window.CBUAppView = new CBUUserView(config)

				discover: ->
					window.CBUAppView = new CBUDiscoverView(config)

				dashboard: ->
					config.model = {id:window.userID}
					window.CBUAppView = new CBUDashboardView(config) 

				createProject: ->
					config.isResource = false
					window.CBUAppView = new CreateView(config)

				createResource: ->
					config.isResource = true
					window.CBUAppView = new CreateView(config)

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

			window.arrayToListString = (arr_) ->
				for str,i in arr_
					arr_[i] = capitalize(str)

				if (arr_.length <= 1) 
					str = arr_.join()
				else
					str = arr_.slice(0, -1).join(", ") + " and " + arr_[arr_.length-1]
				str

			window.capitalize = (str_) ->
				str = str_.replace /\w\S*/g, (txt) ->
					txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()

			window.buttonize3D = ->
				$btn3d = $('.btn-3d')
				for btn in $btn3d 
					$btn = $(btn)
					$btn.parent().addClass('btn-3d-parent')
					$btn.attr('data-content', $btn.html())
		 
			### STICKY FOOTER ###
			$window      = $(window)
			footerHeight = 0 
			$footer      = $(".footer-nav")

			window.positionFooter = ->
				delay 100, ->
					footerHeight = parseInt($footer.height()) +  parseInt($footer.css('margin-top'))
					console.log $footer.css('margin-top'), footerHeight, $(document.body).height(), $window.height()

					if ($(document.body).height()+footerHeight) < $window.height()
						$footer.css
							position: "fixed" 
							bottom: 0
					else
						$footer.css position: "relative" 
			
			positionFooter()
			$window.scroll(positionFooter).resize(positionFooter)

			window.onPageElementsLoad = ->
				positionFooter()
			### END STICKY FOOTER ### 

			$('.nav.nav-pills.pull-right').slicknav
				label: '', 
				prependTo:'#responsive-menu'

			$clone     = $('.resp-append')
			$cloneLast = $('.resp-append-last')
			$clone.clone().appendTo $('.slicknav_nav')
			$cloneLast.clone().appendTo $('.slicknav_nav')