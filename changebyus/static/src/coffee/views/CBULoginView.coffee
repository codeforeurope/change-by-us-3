define ["underscore", "backbone", "jquery", "template"], (_, Backbone, $, temp) ->
	
	CBUDLoginView = Backbone.View.extend
		parent: "body"
		templateDir: "/static"
		viewData: {} 
		
		initialize: (options) ->
			@templateDir = options.templateDir or @templateDir
			@parent = options.parent or @parent
			@viewData = options.viewData or @viewData
			@render()

		render: -> 
			@$el = $("<div class='login'/>")
			@$el.template @templateDir + "/templates/login.html",
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
			$submit   = $("input[type='submit']")
			$form     = $("form")
			$login    = $("form[name='signin']")
			$feedback = $("#login-feedback")
			options   =
				beforeSubmit: =>
					$form.find("input, textarea").attr("disabled", "disabled")
					$feedback.removeClass("alert").html ""

				success: (response) =>
					$form.find("input, textarea").removeAttr("disabled")

					if response.msg.toLowerCase() is "ok"
						window.location.href = "/"
					else
						$feedback.addClass("alert").html response.msg

			$login.ajaxForm options