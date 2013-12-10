define ["underscore", "backbone", "jquery", "template", "validate", "abstract-view"], 
	(_, Backbone, $, temp, valid, AbstractView) ->
		CBUDLoginView = AbstractView.extend
			
			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: -> 
				@$el = $("<div class='login'/>")
				@$el.template @templateDir + "/templates/login.html",
					data: @viewData, =>
						@ajaxForm()
						@addListeners()
						onPageElementsLoad()

				$(@parent).append @$el

			addListeners: ->
				$(".btn-info").click (e) ->
					e.preventDefault()
					url = $(this).attr("href")
					popWindow url


			ajaxForm: -> 
				$submit   = $("input[type='submit']")
				$form     = $("form")
				$feedback = $(".login-feedback")
				options   =
					type: $form.attr('method')
					url: $form.attr('action')
					dataType: "json" 
					contentType: "application/json; charset=utf-8"
					beforeSend: => 
						if $form.valid()
							$form.find("input, textarea").attr("disabled", "disabled")
							$feedback.removeClass("alert").removeClass("alert-danger").html ""
							return true
						else
							return false

					success: (response) =>
						$form.find("input, textarea").removeAttr("disabled")

						#if response.msg.toLowerCase() is "ok" 
						if response.success
							window.location.href = "/"
						else
							$feedback.addClass("alert").addClass("alert-danger").html response.msg

				$form.submit ->
					json_str = JSON.stringify($form.serializeJSON())
					options.data = json_str
					console.log 'options.data',options.data
					$.ajax options
					false