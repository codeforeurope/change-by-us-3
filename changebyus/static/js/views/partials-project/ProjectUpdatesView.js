/*
define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"views/partials-project/ProjectSubView", 
		"views/partials-universal/UpdateListItemView"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 ProjectSubView, 
	 UpdateListItemView) ->

		UpdatesView = ProjectSubView.extend

			parent: "#project-update"
			members: null
			$ul:null
			currentData:""

			initialize: (options) -> 
				ProjectSubView::initialize.call(@, options)
				@members                   = options.members || @members
				@viewData.isOwnerOrganizer = options.isOwnerOrganizer

			render: ->  
				@$el = $(@parent)
				@$el.template @templateDir+"/templates/partials-project/project-updates.html",
					{data: @viewData}, =>@onTemplateLoad()  

			onTemplateLoad:->
				ProjectSubView::onTemplateLoad.call @ 

			addAll: ->  
				alert 'addAll' 
				# members
				@$members = @$el.find(".team-members ul")
				length = 0
				@members.each (model) => 
					if (length++ < 4) then @addMember model
				if length <= 4 then $('.team-members .pull-right').remove()

				@$day = $('<div />')
				@$day.template @templateDir+"/templates/partials-universal/entries-day-wrapper.html",
					{}, =>
						if @collection.length > 0
							model_ = @collection.models[0]
							m = moment(model_.get("created_at")).format("MMMM D")
							@newDay(m)

						@isDataLoaded = true
						ProjectSubView::addAll.call(@) 
						onPageElementsLoad()

			addMember: (model_) -> 
				if model_.get("roles").length is 0 then model_.set("roles", ["Owner"]) # temp fix
				$member = $('<li/>')
				$member.template @templateDir+"/templates/partials-project/project-member-avatar.html",
					{data: model_.attributes}, =>  
				@$members.append $member
				console.log 'addMember !!! >>> ',model_

			newDay:(date_)->
				console.log 'newDay',date_
				@currentDate = date_
				@$currentDay = @$day.clone()
				@$el.append @$currentDay
				@$currentDay.find('h4').html(date_)
				@$ul = @$currentDay.find('.bordered-item') 
					
			addOne: (model_) ->
				console.log model_, @$ul
				m = moment(model_.get("created_at")).format("MMMM D")
				if @currentDate isnt m then @newDay(m)

				view = new UpdateListItemView({model: model_})
				@$ul.append view.$el
*/


