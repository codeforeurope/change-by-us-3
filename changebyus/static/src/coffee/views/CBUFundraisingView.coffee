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

            initialize: (options_) ->
                AbstractView::initialize.call @, options_

                @model = new ProjectModel({id:@model.id})
                @model.fetch
                    success: => @onFetch()

            events:
                "click #edit-goal":"onEditGoalClick"

            render: ->
                @$el = $("<div class='body-container'/>") if @$el.html() is ""
                @$el.template @templateDir+"partials-universal/stripe-review.html",
                    data:@stripe,  =>@onTemplateLoad()
                $(@parent).append @$el
                @$el.show()

            # EVENTS 
            # ----------------------------------------------------------------------
            onEditGoalClick:->
                @$el.toggle()
                @$review.toggle()
                false

            onFetch:->
                @stripe = @model.get("stripe_account")
                @stripe.project_id = @model.id
                @stripe.account_id = @stripe.id
                @render()

            onTemplateLoad:-> 
                @$review = $("<div class='body-container'/>") if @$review is null
                @$review.template @templateDir+"partials-universal/stripe-form.html",
                    data:@stripe,  =>@ajaxForm()
                $(@parent).append @$review
                @$review.hide()

                AbstractView::onTemplateLoad.call @

            # AJAX FORM
            # ----------------------------------------------------------------------
            ajaxForm:-> 
                $form = @$review.find('form')
                options =
                    success: (response_) =>
                        if response_.success
                            @stripe.description = response_.data.description
                            @stripe.goal = response_.data.funding
                            @render()

                $form.ajaxForm options