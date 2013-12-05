define ["underscore", "backbone", "jquery", "template", "form", "abstract-view", "views/partials-project/ProjectCreateModalView", "bootstrap", "autocomp","hogan", "validate", "dropkick"], 
	(_, Backbone, $, temp, form, AbstractView, ProjectCreateModalView, bootstrap, autocomp, Hogan, valid, dropkick) ->
		ProjectCreateView = AbstractView.extend

			location:{name: "", lat: 0, lon: 0} 

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: ->
				@$el = $("<div class='create-project'/>")
				@$el.template @templateDir + "/templates/partials-project/project-create-form.html",
					data: @viewData, => 
						onPageElementsLoad()
						@ajaxForm()
				$(@parent).append @$el

			ajaxForm: ->
				$('.fileupload').fileupload({uploadtype: 'image'})

				$dropkick = $('#project-category').dropkick()

				# ajax the form
				$submit = $("input[type=submit]")
				$form = @$el.find("form")
				options =
					type: $form.attr('method')
					url: $form.attr('action')
					dataType: "json" 
					#contentType: "application/json; charset=utf-8"
					contentType: "multipart/form-data; charset=utf-8"
					#beforeSend: =>  
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
						console.log 'res',res
						$form.find("input, textarea").removeAttr("disabled")
						
						if res.success
							$form.resetForm()
							modal = new ProjectCreateModalView({viewData:res})
							#window.location = "/project/"+res.data.id+"/admin"
						else
							# $form.resetForm()
							 
				###
				$form.submit ->
					json_str = JSON.stringify($form.serializeJSON())
					options.data = json_str
					console.log 'options.data',options.data
					$.ajax options
					false
				###
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