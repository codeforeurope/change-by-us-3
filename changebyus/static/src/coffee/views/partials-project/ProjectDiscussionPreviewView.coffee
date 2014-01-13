define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		ProjectDiscussionPreviewView = AbstractView.extend

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: ->
				@$el = $("<div class='project'/>")
				@$el.template @templateDir+"/templates/partials-project/project-discussion-preview.html",
					{data: @viewData}, =>@ajaxForm()
				$(@parent).append @$el 

