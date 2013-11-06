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

		ajaxForm: ->
			$signin = $("form[name='signin']")
			$submit = $("input[type='submit']")
			$feedback = $("#login-feedback")

			console.log 'ajaxForm',$signin
			options =
				beforeSubmit: =>
					console.log 'beforeSubmit'
					$submit.prop "disabled", true
					$feedback.removeClass("alert").html ""

				success: (response) =>
					$submit.prop "disabled", false
					if response.msg.toLowerCase() is "ok"
						window.location.href = "/"
					else
						$feedback.addClass("alert").html response.msg

			$signin.ajaxForm options
