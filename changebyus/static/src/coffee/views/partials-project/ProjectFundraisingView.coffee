define ["underscore", "backbone", "jquery", "template",  "form", "abstract-view"], 
    (_, Backbone, $, temp, form, AbstractView) ->
        ProjectFundraisingView = AbstractView.extend
            
            parent: "#project-fundraising"
            reviewDiv: "#review-fundraising"
            setupDiv: "#setup-fundraising"

            name:"My Project"
            
            initialize: (options_) ->
                options = options_
                AbstractView::initialize.call @, options
                @name = options.name || @name
                @render()

            events:
                "click #get-started":"linkStripe"
                "click #does-it-work":"slideToggle"
                "click #edit-goal":"onEditGoalClick"

            render: -> 
                @$el    = $(@reviewDiv)
                @stripe = @model.get("stripe_account")
                
                if @stripe
                    @$el.template @templateDir+"partials-universal/stripe-review.html",
                        {data: @stripe}, => @onTemplateLoad()
                else
                    @$el.template @templateDir+"partials-project/project-fundraising-get-started.html", 
                        {}, => @getStarted()
                            
            onTemplateLoad:-> 
                @$setup = $(@setupDiv)
                @$setup.template @templateDir+"partials-universal/stripe-form.html",
                    {data:@stripe}, => @ajaxForm()
                @$setup.hide()

                AbstractView::onTemplateLoad.call @

            getStarted:-> 
                @delegateEvents()

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

            onEditGoalClick:(e)-> 
                @$el.toggle() 
                @$setup.toggle()

            slideToggle:->
                @$how.slideToggle()

                        # AJAX FORM
            # ----------------------------------------------------------------------
            ajaxForm:-> 
                console.log 'ajaxForm'
                $form = @$el.find('form')
                options =
                    success: (response_) =>
                        if response_.success
                            @stripe.description = response_.data.description
                            @stripe.goal = response_.data.funding
                            @render()

                $form.ajaxForm options