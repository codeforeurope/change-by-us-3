define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"abstract-view", 
		"views/partials-project/ProjectSubView",
		"views/partials-project/ProjectWysiwygFormView",
		"views/partials-project/ProjectUpdateListItemView",
		"views/partials-project/ProjectUpdateSuccessModalView"],
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 AbstractView, 
	 ProjectSubView, 
	 ProjectWysiwygFormView, 
	 ProjectUpdateListItemView, 
	 ProjectUpdateSuccessModalView) ->

		ProjectAddUpdateView = ProjectSubView.extend

			parent: "#project-update"

			render: -> 
				@$el = $(@parent)
				@$el.template @templateDir + "/templates/partials-project/project-add-update.html",
					{data: @viewData}, => @onTemplateLoad()

			onTemplateLoad:-> 
				ProjectSubView::onTemplateLoad.call @
				
				@$ul = @$el.find('.updates-container ul')
				form = new ProjectWysiwygFormView({parent:"#update-form"})
				form.on 'ON_TEMPLATE_LOAD', => 
					$("#post-update").click ->
						$("html, body").animate({ scrollTop: 0 }, "slow")

					$submit = form.$el.find('input[type="submit"]')
					
					form.beforeSubmit = (arr_, form_, options_)->  
						$submit.find("input, textarea").attr("disabled", "disabled")

					form.success = (response_)=>
						if response_.success
							@addModal response_.data
						console.log 'response_',response_

					$shareOptions = $(".share-options")
					$shareToggle = $(".share-toggle")
					$shareToggle.click -> $shareOptions.toggleClass("hide")

					$('input:radio, input:checkbox').screwDefaultButtons
						image: 'url("/static/img/black-check.png")'
						width: 18
						height: 18

			addAll: -> 
				console.log 'addAlladdAlladdAlladdAlladdAlladdAlladdAlladdAll'
				@$day = $('<div />')
				@$day.template @templateDir+"/templates/partials-project/project-entries-day-wrapper.html",
					{}, =>
						if @collection.length > 0
							model_ = @collection.models[0]
							m = moment(model_.attributes.updated_at).format("MMMM D")
							@newDay(m)

						@isDataLoaded = true
						ProjectSubView::addAll.call(@) 
						onPageElementsLoad()

			newDay:(date_)->
				console.log 'newDay',date_
				@currentData = date_
				@$currentDay = @$day.clone()
				@$el.append @$currentDay
				@$currentDay.find('h4').html(date_)
				@$ul = @$currentDay.find('.bordered-item') 
					
			addOne: (model_) ->
				m = moment(model_.attributes.updated_at).format("MMMM D")
				if @currentData isnt m then @newDay(m)
				console.log "ProjectAddUpdateView addOne model", model_
				view = new ProjectUpdateListItemView({model: model_})
				@$ul.append view.render().$el 

			addModal:(data_)->
				console.log "ProjectAddUpdateView addModal model", data_
				@modal = new ProjectUpdateSuccessModalView({model:data_})
