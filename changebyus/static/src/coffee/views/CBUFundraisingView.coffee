define ["underscore",
		"backbone",
		"jquery",
		"template",
		"abstract-view",
		"model/UserModel",
		"model/ProjectModel"],
	(_,
	 Backbone,
	 $,
	 temp,
	 AbstractView,
	 UserModel,
	 ProjectModel) ->

			CBUFundraisingView = AbstractView.extend

				$review:null
				stripe:{}

				initialize: (options) ->
					AbstractView::initialize.call @, options

					@model = new ProjectModel({id:@model.id})
					@model.fetch
						success: => @onFetch()

				onEditGoalClick:->
					@$el.toggle()
					@$review.toggle()

				onFetch:->
					@stripe = @model.get("stripe_account")
					@stripe.project_id = @model.id
					@stripe.account_id = @stripe.id
					@render()

				render: ->
					@$el = $("<div class='body-container'/>") if @$el.html() is ""
					@$el.template @templateDir+"/templates/partials-universal/stripe-review.html",
						data:@stripe,  =>@onTemplateLoad()
					$(@parent).append @$el
					@$el.show()


				onTemplateLoad:->
					AbstractView::onTemplateLoad.call @

					@$review = $("<div class='body-container'/>") if @$review is null
					@$review.template @templateDir+"/templates/partials-universal/stripe-form.html",
						data:@stripe,  =>@ajaxForm()
					$(@parent).append @$review
					@$review.hide()

					$('#edit-goal').click (e)=>
						e.preventDefault()
						@onEditGoalClick()

				ajaxForm:->
					$form = @$review.find('form')
					options =
						success: (response_) =>
							if response_.success
								@stripe.description = response_.data.description
								@stripe.goal = response_.data.funding
								@render()

					$form.ajaxForm options