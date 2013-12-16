define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"abstract-view", 
		"views/partials-project/ProjectSubView",
		"views/partials-universal/WysiwygFormView",
		"views/partials-universal/UpdateListItemView",
		"views/partials-project/ProjectUpdateSuccessModalView"],
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 AbstractView, 
	 ProjectSubView, 
	 WysiwygFormView, 
	 UpdateListItemView, 
	 ProjectUpdateSuccessModalView) ->

		ProjectAddUpdateView = ProjectSubView.extend

			parent: "#project-update"

			events: 
				"click #post-update":"animateUp"
				"click .share-toggle":"shareToggle"

			shareToggle:->
				$(".share-toggle").toggleClass("hide")

			render: -> 
				@$el = $(@parent) 
				@viewData.image_url_round_small = $('.profile-nav-header img').attr('src');
				@$el.template @templateDir + "/templates/partials-project/project-add-update.html",
					{data: @viewData}, => @onTemplateLoad()


			onTemplateLoad:-> 
				ProjectSubView::onTemplateLoad.call @
				
				@$ul = @$el.find('.updates-container ul')
				form = new WysiwygFormView({parent:"#update-form"})
				form.on 'ON_TEMPLATE_LOAD', =>  
					$submit = form.$el.find('input[type="submit"]')
					
					form.beforeSubmit = (arr_, form_, options_)->  
						$submit.find("input, textarea").attr("disabled", "disabled")

					form.success = (response_)=>
						if response_.success
							@addModal response_.data 

					@$el.find('input:radio, input:checkbox').screwDefaultButtons
						image: 'url("/static/img/black-check.png")'
						width: 18
						height: 18

			addAll: ->  
				@$day = $('<div />')
				@$day.template @templateDir+"/templates/partials-project/project-entries-day-wrapper.html",
					{}, =>
						if @collection.length > 0
							model_ = @collection.models[0]
							m = moment(model_.get("updated_at")).format("MMMM D")
							@newDay(m)

						@isDataLoaded = true
						ProjectSubView::addAll.call(@) 
						onPageElementsLoad()

			newDay:(date_)-> 
				@currentDate = date_
				@$currentDay = @$day.clone()
				@$el.append @$currentDay
				@$currentDay.find('h4').html(date_)
				@$ul = @$currentDay.find('.bordered-item') 
					
			addOne: (model_) ->
				m = moment(model_.get("updated_at")).format("MMMM D")
				if @currentDate isnt m then @newDay(m) 
				view = new UpdateListItemView({model: model_})
				@$ul.append view.$el 

			addModal:(data_)-> 
				@modal = new ProjectUpdateSuccessModalView({model:data_})

			animateUp:->
				$("html, body").animate({ scrollTop: 0 }, "slow")
