define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
	ProjectDiscussionListItemView = AbstractView.extend
		
		tagName: "li"

		initialize: (options) ->
			AbstractView::initialize.call @, options
			@render()

		render: ->
			m = moment(@model.attributes.created_at).format("MMMM D hh:mm a")
			@model.attributes.format_date = m

			@$el = $(@el)
			@$el.template @templateDir + "/templates/partials-project/project-discussion-list-item.html",
				{data: @model.attributes}, =>
					@$el.find('.user-avatar, .description').click =>
						@trigger "click", @model
					@$el.find('.delete').click =>
						@trigger "delete", @model
					console.log @$el.find('.delete')
			@

