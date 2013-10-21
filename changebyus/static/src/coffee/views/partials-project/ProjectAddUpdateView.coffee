define ["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectWysiwygFormView"],
	(_, Backbone, $, temp, AbstractView, ProjectWysiwygFormView) ->
		ProjectAddUpdateView = AbstractView.extend

			parent: "#project-update"
		
			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: -> 
				@$el = $(@parent)
				@$el.template @templateDir + "/templates/partials-project/project-add-update.html",
					{data: @viewData}, => 
						form = new ProjectWysiwygFormView({parent:"#update-form"})
				 
						form.beforeSubmit = (arr_, form_, options_)->
							share = []
							if $("#twitter").val() is "on" then share.push 'twitter'
							if $("#facebook").val() is "on" then share.push 'facebook'
							arr_.push {name: "social_sharing", value:share, type: "hidden", required: false}
							# console.log('form.beforeSubmit', arr_, form_, options_)

						$shareOptions = $(".share-options")
						$shareToggle = $(".share-toggle")
						$shareToggle.click -> $shareOptions.toggleClass("hide")
