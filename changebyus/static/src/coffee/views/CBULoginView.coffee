define ["underscore", "backbone", "jquery", "template", "validate", "abstract-view"], 
	(_, Backbone, $, temp, valid, AbstractView) ->
		CBUDLoginView = AbstractView.extend
			
			initialize: (options_) ->
				AbstractView::initialize.call @, options_
				@render()

			events:
				"click .btn-info":"popUp"

			render: -> 
				@$el = $("<div class='login'/>")
				@$el.template @templateDir+"/templates/login.html",
					data: @viewData, =>
						@ajaxForm() 
						onPageElementsLoad()

				$(@parent).append @$el

			popUp:(e)->
				e.preventDefault()
				url = $(e.currentTarget).attr("href")
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

					success: (response_) =>
						$form.find("input, textarea").removeAttr("disabled")

						#if response.success 
						if response_.success
							window.location.href = "/"
						else
							$feedback.addClass("alert").addClass("alert-danger").html response_.msg

				$form.submit ->
					json_str = JSON.stringify($form.serializeJSON())
					options.data = json_str
					$.ajax options
					false