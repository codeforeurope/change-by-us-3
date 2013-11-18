define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"abstract-view", 
		"views/partials-project/ProjectSubView",
		"views/partials-project/ProjectWysiwygFormView",
		"views/partials-project/ProjectUpdateListItemView",
		"views/partials-project/ProjectUpdateSuccessModalView"],
	(_, Backbone, $, temp, AbstractView, ProjectSubView, ProjectWysiwygFormView, ProjectUpdateListItemView, ProjectUpdateSuccessModalView) ->
		ProjectAddUpdateView = ProjectSubView.extend

			parent: "#project-update"
		
			initialize: (options) ->
				ProjectSubView::initialize.call @, options
				@render()

			render: -> 
				@$el = $(@parent)
				@$el.template @templateDir + "/templates/partials-project/project-add-update.html",
					{data: @viewData}, => @onTemplateLoad()

			onTemplateLoad:->
				@$ul = @$el.find('.updates-container ul')
				form = new ProjectWysiwygFormView({parent:"#update-form"})
				$submit = form.$el.find('input[type="submit"]')
				
				form.beforeSubmit = (arr_, form_, options_)-> 
					$submit.find("input, textarea").attr("disabled", "disabled")
					share = []
					if $("#twitter").prop('checked') then share.push 'twitter'
					if $("#facebook").prop('checked') then share.push 'facebook'
					arr_.push {name: "social_sharing", value:share, type: "hidden", required: false}
					#console.log 'form.beforeSubmit',$("#twitter").prop('checked'),$("#facebook").prop('checked')

				form.success = (response_)=>
					if response_.success
						@addModal response_.data
					console.log 'response_',response_

				$shareOptions = $(".share-options")
				$shareToggle = $(".share-toggle")
				$shareToggle.click -> $shareOptions.toggleClass("hide")

			noResults:->

					
			addOne: (model_) ->
				console.log "ProjectAddUpdateView addOne model", model_
				view = new ProjectUpdateListItemView({model: model_})
				@$ul.append view.render().$el 

			addModal:(data_)->
				console.log "ProjectAddUpdateView addModal model", data_
				@modal = new ProjectUpdateSuccessModalView({model:data_})
