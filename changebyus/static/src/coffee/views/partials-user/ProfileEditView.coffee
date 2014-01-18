define ["underscore", "backbone", "jquery", "template", "abstract-view", "serializeObject"], 
	(_, Backbone, $, temp, AbstractView, serializeObject) ->
		ProfileEditView = AbstractView.extend

			initialize: (options_) ->
				AbstractView::initialize.call @, options_
				@viewData = @model.attributes

				$.get "/api/user/socialstatus", (response_)=>
					try
						@viewData.facebook = response_.data.facebook
						@viewData.twitter  = response_.data.twitter
					catch e
						
					@render()

			events:
				"click .social-btns a":"socialClick"

			render: ->
				@$el = $(@parent)
				@$el.template @templateDir+"/templates/partials-user/profile-edit-form.html", 
					{data:@viewData}, => @onTemplateLoaded()

			socialClick:(e)->
				e.preventDefault()
				url = $(e.currentTarget).attr("href")
				popWindow url

			onTemplateLoaded:->
				@ajaxForm()

				$('input[name="visibility"]').change ->
					$('input[name="private"]').attr('checked', ($(this).val() is "private"))
					
				AbstractView::onTemplateLoad.call @

			ajaxForm: ->
				$('.fileupload').fileupload({uploadtype: 'image'})

				# ajax the form
				$submit   = @$el.find("input[type=submit]")
				$form     = @$el.find("form")
				$feedback = $("#feedback")
				$inputs   = $form.find("input, textarea")
				options   =
					type: $form.attr('method')
					url: $form.attr('action')
					dataType: "json" 
					contentType: "multipart/form-data; charset=utf-8"
					beforeSubmit:(arr_, form_, options_)->  
						if $form.valid()
							$inputs.attr("disabled", "disabled")
							return true
						else
							return false

					success: (res) -> 
						msg = if res.msg.toLowerCase() is "ok" then "Updated Successfully" else res.msg
						$feedback.show().html(msg)

						$inputs.removeAttr("disabled")

						if res.success
							$("html, body").animate({ scrollTop: 0 }, "slow")
							$feedback.addClass('.alert-success').removeClass('.alert-error')
						else
							$feedback.removeClass('.alert-success').addClass('.alert-error')

				$form.ajaxForm options

				# location autocomplete
				$projectLocation = $("#location")
				$projectLocation.typeahead(
					template: '<div class="zip">{{ name }} {{ zip }}</div>'
					engine: Hogan 
					valueKey: 'name'
					name: 'zip'
					remote:
						url: "/api/project/geopoint?s=%QUERY"
						filter: (resp) ->
							zips = []
							if resp.msg.toLowerCase() is "ok" and resp.data.length > 0
								for loc in resp.data
									zips.push {'name':loc.name,'lat':loc.lat,'lon':loc.lon, 'zip':loc.zip}
							zips
				).bind('typeahead:selected', (obj, datum) =>
						@location = datum
						$('input[name="location"]').val @location.name
						$('input[name="lat"]').val @location.lat
						$('input[name="lon"]').val @location.lon
				)

				# style buttons
				$('input:radio, input:checkbox').screwDefaultButtons
					image: 'url("/static/img/black-check.png")'
					width: 18
					height: 18
