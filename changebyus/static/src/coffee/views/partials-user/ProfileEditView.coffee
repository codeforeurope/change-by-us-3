define ["underscore", "backbone", "jquery", "template", "abstract-view", "serializeObject"], 
	(_, Backbone, $, temp, AbstractView, serializeObject) ->
		ProfileEditView = AbstractView.extend

			initialize: (options) ->
				console.log 'ProfileEditView',options
				AbstractView::initialize.call @, options
				@viewData = @model.attributes

				$.get "/api/user/socialstatus", (response_)=>
					try
						@viewData.facebook = response_.data.facebook
						@viewData.twitter  = response_.data.twitter
					catch e
						
					@render()

			render: ->
				@$el = $(@parent)
				@$el.template @templateDir+"/templates/partials-user/profile-edit-form.html", 
					{data:@viewData}, => @onTemplateLoaded()
						

			onTemplateLoaded:->
				$(".social-btns .btn-primary").click (e) ->
					e.preventDefault()
					url = $(this).attr("href")
					popWindow url

				@ajaxForm()
				onPageElementsLoad()

			ajaxForm: ->
				$('.fileupload').fileupload({uploadtype: 'image'})

				# ajax the form
				$submit   = @$el.find("input[type=submit]")
				$form     = @$el.find("form")
				$feedback = $("#feedback")
				options   =
					type: $form.attr('method')
					url: $form.attr('action')
					dataType: "json" 
					#contentType: "application/json; charset=utf-8"
					contentType: "multipart/form-data; charset=utf-8"
					beforeSubmit:(arr_, form_, options_)->  
						if $form.valid()
							showEmail = true
							for i of arr_ 
								if arr_[i].name is "public_email"
									showEmail = false
									break

							if showEmail then arr_.push({name:"public_email",value:false})

							$form.find("input, textarea").attr("disabled", "disabled")
							return true
						else
							return false

					success: (res) -> 
						msg = if res.msg.toLowerCase() is "ok" then "Updated Successfully" else res.msg
						$feedback.show().html(msg)

						$form.find("input, textarea").removeAttr("disabled")

						if res.success
							$("html, body").animate({ scrollTop: 0 }, "slow")
							$feedback.addClass('.alert-success').removeClass('.alert-error')
						else
							$feedback.removeClass('.alert-success').addClass('.alert-error')

				###
				$form.submit ->
					obj = $form.serializeJSON()
					if obj.public_email is "on" then obj.public_email=true else obj.public_email=false
					json_str = JSON.stringify(obj)
					options.data = json_str
					console.log 'options.data',options.data
					$.ajax options
					false
				###

				$form.ajaxForm options

				# location autocomplete
				$projectLocation = $("#location")
				$projectLocation.typeahead(
					template: '<div class="zip">{{ name }}</div>'
					engine: Hogan 
					valueKey: 'name'
					name: 'zip'
					remote:
						url: "/api/project/geopoint?s=%QUERY"
						filter: (resp) ->
							zips = []
							if resp.msg.toLowerCase() is "ok" and resp.data.length > 0
								for loc in resp.data
									zips.push {'name':loc.name,'lat':loc.lat,'lon':loc.lon}
							zips
				).bind('typeahead:selected', (obj, datum) =>
						@location = datum
						$('input[name="location"]').val @location.name
						$('input[name="lat"]').val @location.lat
						$('input[name="lon"]').val @location.lon
						console.log(datum)
				)

				# style buttons
				$('input:radio, input:checkbox').screwDefaultButtons
					image: 'url("/static/img/black-check.png")'
					width: 18
					height: 18
