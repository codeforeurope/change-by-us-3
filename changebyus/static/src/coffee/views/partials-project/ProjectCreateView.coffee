define ["underscore", "backbone", "jquery", "template", "form", "abstract-view", "bootstrap", "autocomp","hogan","validate", "dropkick"], 
	(_, Backbone, $, temp, form, AbstractView, bootstrap, autocomp, Hogan, valid, dropkick) ->
		ProjectCreateView = AbstractView.extend

			location:{name: "", lat: 0, lon: 0} 

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: ->
				@$el = $("<div class='create-project'/>")
				@$el.template @templateDir + "/templates/partials-project/project-create-form.html",
					data: @viewData, => @ajaxForm()

				$(@parent).append @$el

			ajaxForm: ->
				$('.fileupload').fileupload({uploadtype: 'image'})

				$dropkick = $('#project-category').dropkick()

				# ajax the form
				$submit = $("input[type=submit]")
				$form = @$el.find("form")
				options =
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
						$form.find("input, textarea").remove("disabled")
						
						if res.success
							$form.resetForm()
							window.location = "/project/"+res.data.id
						else
							# $form.resetForm()
							
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