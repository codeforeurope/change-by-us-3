define ["underscore", "backbone", "jquery", "template", "form", "abstract-view", "views/partials-universal/CreateModalView", "bootstrap", "autocomp","hogan", "validate", "dropkick"], 
	(_, Backbone, $, temp, form, AbstractView, CreateModalView, bootstrap, autocomp, Hogan, valid, dropkick) ->
		CreateView = AbstractView.extend

			location:{name: "", lat: 0, lon: 0} 
			isResource:false

			initialize: (options) ->
				AbstractView::initialize.call @, options 
				@isResource = options.isResource || @isResource 
				@render()

			render: -> 
				templateURL = if @isResource then "/templates/partials-resource/resource-create-form.html" else  "/templates/partials-project/project-create-form.html"
				@$el = $("<div class='create-project'/>")
				@$el.template @templateDir+templateURL,
					data: @viewData, => 
						onPageElementsLoad()
						@ajaxForm()
				$(@parent).append @$el

			ajaxForm: ->
				$('.fileupload').fileupload({uploadtype: 'image'})

				$dropkick = $('#project-category').dropkick()
				$feedback = $("#feedback")
				isResource = @isResource

				# ajax the form
				$submit = $("input[type=submit]")
				$form = @$el.find("form")
				options =
					type: $form.attr('method')
					url: $form.attr('action')
					dataType: "json"  
					contentType: "multipart/form-data; charset=utf-8"
	
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
						$form.find("input, textarea").removeAttr("disabled")
						
						if res.success
							config = {}
							config.viewData = res
							config.viewData.isResource = isResource

							$form.resetForm()
							modal = new CreateModalView(config)
							$feedback.hide()
						else
							$("html, body").animate({ scrollTop: 0 }, "slow")
							$feedback.show().html(res.msg)

				$form.ajaxForm options

				# location autocomplete
				$location = if @isResource then $("#resource_location") else $("#project_location")
				$location.typeahead(
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