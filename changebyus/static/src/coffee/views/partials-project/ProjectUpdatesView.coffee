define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"views/partials-project/ProjectSubView", 
		"views/partials-project/ProjectUpdateListItemView"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 ProjectSubView, 
	 ProjectUpdateListItemView) ->

		ProjectUpdatesView = ProjectSubView.extend

			parent: "#project-update"
			members: null
			$ul:null
			currentData:""

			initialize: (options) -> 
				ProjectSubView::initialize.call(@, options)
				@members           = options.members || @members
				@viewData.isMember = options.isMember

			render: ->  
				@$el = $(@parent)
				@$el.template @templateDir+"/templates/partials-project/project-updates.html",
					{data: @viewData}, =>@onTemplateLoad()  

			onTemplateLoad:->
				ProjectSubView::onTemplateLoad.call @ 

			addAll: -> 
				console.log 'members addAll'
				# members
				@$members = @$el.find(".team-members ul")
				length = 0
				@members.each (model) => 
					if (length++ < 4) then @addMemeber model
				if length <= 4 then $('.team-members .pull-right').remove()

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

			addMemeber: (model_) ->
				console.log 'addMemeber',model_
				$member = $('<li/>')
				$member.template @templateDir + "/templates/partials-project/project-member-avatar.html",
					{data: model_.attributes}, =>  
				@$members.append $member

			newDay:(date_)->
				console.log 'newDay',date_
				@currentDate = date_
				@$currentDay = @$day.clone()
				@$el.append @$currentDay
				@$currentDay.find('h4').html(date_)
				@$ul = @$currentDay.find('.bordered-item') 
					
			addOne: (model_) ->
				console.log model_, @$ul
				m = moment(model_.get("updated_at")).format("MMMM D")
				if @currentDate isnt m then @newDay(m)

				view = new ProjectUpdateListItemView({model: model_})
				@$ul.append view.$el 