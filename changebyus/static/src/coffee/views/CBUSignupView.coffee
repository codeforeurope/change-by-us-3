define ["underscore", "backbone", "jquery", "template"], (_, Backbone, $, temp) ->
	
	# to do
	# if (success){}
	# if (failure){} 
	CBUSignupView = Backbone.View.extend
		parent: "body"
		templateDir: "/static"
		viewData: {}
		initialize: (options) ->
			@templateDir = options.templateDir or @templateDir
			@parent = options.parent or @parent
			@viewData = options.viewData or @viewData
			@render()

		render: -> 
			@$el = $("<div class='signup'/>")
			@$el.template @templateDir + "/templates/signup.html",
				data: @viewData, =>
					@ajaxForm()
					@addListeners()

			$(@parent).append @$el

		addListeners: ->
			$(".btn-info").click (e) ->
				e.preventDefault()
				url = $(this).attr("href")
				popWindow url

			$(window).bind "hashchange", (e) => @toggleSubView()
			@toggleSubView()

		ajaxForm: ->
			$signin = $("form[name='signin']")
			$submit = $("input[type='submit']")
			$feedback = $("#login-feedback")

			options =
				beforeSubmit: =>
					console.log 'beforeSubmit'
					$form.find("input, textarea").attr("disabled", "disabled")
					$feedback.removeClass("alert").html ""

				success: (response) =>
					$form.find("input, textarea").removeAttr("disabled")
					if response.msg.toLowerCase() is "ok"
						window.location.href = "/"
					else
						$feedback.addClass("alert").html response.msg

			$signin.ajaxForm options

		toggleSubView:->
			view = window.location.hash.substring(1)

			if view is "facebook"
				$('.facebook-signup').show()
				$('.init-signup').hide()
			else
				$('.facebook-signup').hide()
				$('.init-signup').show()
