define ["underscore", "backbone", "jquery", "template",  "form", "abstract-view"], 
	(_, Backbone, $, temp, form, AbstractView) ->
		ProjectFundraisingView = AbstractView.extend
			
			parent: "#project-fundraising"
			name:"My Project"
			
			initialize: (options) ->
				AbstractView::initialize.call @, options
				@name = options.name || @name;
				@render()

			events:
				"click #get-started":"linkStripe"
				"click #does-it-work":"slideToggle"

			render: -> 
				@$el = $(@parent)
				stripeAccount = @model.get("stripe_account")
				if stripeAccount
					@$el.template @templateDir+"/templates/partials-universal/stripe-review.html",
						{data: stripeAccount}, => @onTemplateLoad()
				else
					@$el.template @templateDir+"/templates/partials-project/project-fundraising-get-started.html", 
						{}, => 
							@getStarted()
							@delegateEvents()

			getStarted:-> 
				@$how = $('.fundraising-left .content-wrapper')
				@$how.slideToggle(1)

			linkStripe:(e)-> 
				e.preventDefault()
				
				# post to API, get URL and pass to popupWindow function
				dataObj = { project_id:@id, project_name:@name }
				$.ajax(
					type: "POST"
					url: "/stripe/link" 
					data: JSON.stringify(dataObj) 
					dataType: "text" 
					contentType: "application/json; charset=utf-8"
				).done (response_)=> 
					popWindow response_ 

			slideToggle:->
				@$how.slideToggle()