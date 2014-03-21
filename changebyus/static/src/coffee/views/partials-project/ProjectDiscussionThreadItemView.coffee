define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "moment", 
        "abstract-view", 
        "model/UserModel",
        "model/UpdateModel"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     moment, 
     AbstractView, 
     UserModel,
     UpdateModel ) ->
        ProjectDiscussionThreadItemView = AbstractView.extend
            
            model:UpdateModel
            $repliesHolder: null
            tagName: "li" 

            initialize: (options_) ->
                AbstractView::initialize.call(@, options_)
                @model.fetch
                    success: =>@loadUser()

            events:
                "click .reply-toggle:first":"onReplyToggle"

            loadUser:->
                @user = new UserModel(id:@model.get("user").id)
                @user.fetch
                    success: =>@render()

            render: ->
                m = moment(@model.get('created_at')).format("MMMM D hh:mm a")
                @model.set('format_date',m)

                @viewData                       = @model.attributes
                @viewData.image_url_round_small = @user.get("image_url_round_small")
                @viewData.display_name          = @user.get("display_name")
 
                $(@el).template @templateDir+"partials-project/project-thread-list-item.html",
                    {data: @viewData}, => @onTemplateLoad()

            # EVENTS
            # ----------------------------------------------------------------------
            onTemplateLoad:->
                @$repliesHolder = $('<ul class="content-wrapper bordered-item np top-caret hide"/>')
                AbstractView::onTemplateLoad.call(@)

            onReplyToggle:->
                top = $("#add-thread-form").offset().top
                $("html, body").animate({ scrollTop: top }, "slow")