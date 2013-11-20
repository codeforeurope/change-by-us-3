define ["underscore", "backbone", "jquery", "template", "abstract-view", "dropkick"],
	(_, Backbone, $, temp, AbstractView, dropkick) ->
		ProjectInfoAppearanceView = AbstractView.extend 
			
			parent: "#project-info"
			location:{name: "", lat: 0, lon: 0} 

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@viewData = @model.attributes
				console.log '@viewData',@viewData
				@render()

			render: ->
				@$el = $("<div />")
				@$el.template @templateDir + "/templates/partials-project/project-info-appearance.html",
					data: @viewData, => 
						onPageElementsLoad()
						@ajaxForm()

				$(@parent).append @$el 

			ajaxForm: ->
				$('.fileupload').fileupload({uploadtype: 'image'})

				$dropkick = $('#project-category').dropkick()

				# ajax the form
				$submit   = $("input[type=submit]")
				$form     = @$el.find("form")
				$feedback = $("#feedback")
				options   =
					beforeSubmit: => 
						if $form.valid()
							$zip = $('input[name="zip"]')

							if @location.name isnt "" and @location.name is $zip.val() 
								$form.find("input, textarea").attr("disabled", "disabled")
								return true
							else
								if $zip.val() is ""
									console.log('# zip warning')
								else
									console.log('# zip show')
									$('.tt-dropdown-menu').show()
								return false
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

				# location autocomplete
				$projectLocation = $("#project_location")
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

				$('input:radio').screwDefaultButtons
					image: 'url("/static/img/icon-lock.png")'
					width: 60
					height: 25