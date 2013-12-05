define ["underscore", "backbone", "jquery", "template", "abstract-view", "serializeJSON"], 
	(_, Backbone, $, temp, AbstractView, serialize) ->
		CBUSignupView = AbstractView.extend

			socialInfo:null

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: -> 
				@$el = $("<div class='signup'/>")
				@$el.template @templateDir + "/templates/signup.html",
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

				$(window).bind "hashchange", (e) => @toggleSubView()
				@toggleSubView()

			ajaxForm: ->
				# signup --------------------------------------------------
				$signup   = $(".init-signup")
				$form     = $signup.find("form") 
				$submit   = $signup.find("input[type='submit']")
				$feedback = $signup.find(".login-feedback")

				options =
					type: $form.attr('method')
					url: $form.attr('action')
					dataType: "json" 
					contentType: "application/json; charset=utf-8"
					beforeSend: => 
						$form.find("input, textarea").attr("disabled", "disabled")
						$feedback.removeClass("alert").removeClass("alert-danger").html ""

					success: (response) =>
						console.log 'signup',response
						$form.find("input, textarea").removeAttr("disabled")
						if response.msg.toLowerCase() is "ok"
							window.location.href = "/"
						else
							$feedback.addClass("alert").addClass("alert-danger").html response.msg
 
				$form.submit -> 
					json_str = JSON.stringify($form.serializeJSON())
					options.data = json_str
					console.log 'options.data',options.data
					$.ajax options
					false

				# social signup --------------------------------------------------
				$socialSignup   = $(".social-signup")
				$socialForm     = $socialSignup.find("form") 
				$socialSubmit   = $socialSignup.find("input[type='submit']")
				$socialFeedback = $socialSignup.find(".login-feedback")

				socialOptions =
					type: $socialForm.attr('method')
					url: $socialForm.attr('action')
					dataType: "json" 
					contentType: "application/json; charset=utf-8"
					beforeSend: => 
						$socialForm.find("input, textarea").attr("disabled", "disabled")
						$socialFeedback.removeClass("alert").html ""

					success: (response) =>
						console.log 'signup',response
						$socialForm.find("input, textarea").removeAttr("disabled")
						if response.msg.toLowerCase() is "ok"
							window.location.href = "/"
						else
							$socialFeedback.addClass("alert").html response.msg

				$socialForm.submit ->
					json_str = JSON.stringify($socialForm.serializeJSON())
					options.data = json_str
					console.log 'options.data',options.data
					$.ajax options
					false

			toggleSubView:->
				view = window.location.hash.substring(1)

				if view is "facebook" or view is "twitter"
					$('.social-signup').show()
					$('.init-signup').hide()
					@getSocialInfo()
				else
					$('.social-signup').hide()
					$('.init-signup').show()

			getSocialInfo:->
				unless @socialInfo
					$socialSignup   = $(".social-signup")
					$socialForm     = $socialSignup.find("form")
					$socialForm.find("input, textarea").attr("disabled", "disabled")

					if @ajax then @ajax.abort()
					@ajax = $.ajax(
						type: "GET"
						url: "/api/user/socialinfo"
					).done (response_)=>
						console.log "response_",response_
						if response_.msg.toLowerCase() is "ok"
							@setSocialInfo(response_.data)
						$socialForm.find("input, textarea").removeAttr("disabled")

			setSocialInfo:(data_)->
				@socialInfo = data_
				img = if (@socialInfo.fb_image isnt "") then @socialInfo.fb_image else @socialInfo.twitter_image
				name = if (@socialInfo.fb_name isnt "") then  @socialInfo.fb_name else @socialInfo.twitter_name

				$socialAvatar = $('.social-avatar')
				$socialSignup = $(".social-signup")

				$socialAvatar.find('img').attr('src',img)
				$socialAvatar.find('span').html name
				$socialSignup.find('input[name="id"]').val @socialInfo.id
				$socialSignup.find('input[name="email"]').val @socialInfo.email if @socialInfo.email isnt "None"
				$socialSignup.find('input[name="display_name"]').val @socialInfo.display_name

				console.log @socialInfo,$('.social-avatar').find('img')
