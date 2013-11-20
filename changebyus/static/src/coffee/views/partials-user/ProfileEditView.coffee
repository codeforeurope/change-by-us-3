define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		ProfileEditView = AbstractView.extend

			initialize: (options) ->
				console.log 'ProfileEditView',options
				AbstractView::initialize.call @, options
				@viewData = @model.attributes
				@render()

			render: ->
				@$el = $(@parent)
				@$el.template @templateDir+"/templates/partials-user/profile-edit-form.html", 
					{data:@viewData}, => 
						@ajaxForm()
						onPageElementsLoad()

			ajaxForm: ->
				$('.fileupload').fileupload({uploadtype: 'image'})

				# ajax the form
				$submit = @$el.find("input[type=submit]")
				$form = @$el.find("form")
				$feedback = $("#feedback")
				options =
					beforeSubmit:(arr_, form_, options_)-> 
						console.log 'arr_',arr_ 
						if $form.valid()
							###
							for i of arr_ 
								if arr_[i].name is "public_email"
									arr_[i].value = $form.find('input[name=public_email]').val()
							###

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
				$form.ajaxForm options

				console.log '$form',$form

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

				$('input:radio, input:checkbox').screwDefaultButtons
					image: 'url("/static/img/black-check.png")'
					width: 18
					height: 18
