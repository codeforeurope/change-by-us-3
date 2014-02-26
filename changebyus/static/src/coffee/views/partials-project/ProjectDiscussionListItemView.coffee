define ["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel"], 
    (_, Backbone, $, temp, AbstractView, UserModel) ->
        ProjectDiscussionListItemView = AbstractView.extend
            
            tagName: "li"
            user:null

            initialize: (options_) ->
                AbstractView::initialize.call @, options_
                
                @user = new UserModel(id:@model.get("user").id)
                @user.fetch
                    success: =>@onFetch()

            events: 
                "click .description": "viewDescription",
                "click .user-avatar": "viewDescription",
                "click .delete-x": "delete" 

            render: ->
                @$el = $(@el)
                @$el.template @templateDir+"partials-project/project-discussion-list-item.html",
                    {data: @viewData}, => @onTemplateLoad()

            viewDescription: ->
                @trigger "click", @model

            delete:->
                confirmation = confirm("Do you really want to delete this post?")
                if confirmation then @model.collection.remove @model

            onFetch:->
                m =  moment(@model.get("created_at")).format("MMMM D hh:mm a")
                @model.set("format_date", m)

                @viewData                       = @model.attributes
                @viewData.image_url_round_small = @user.get("image_url_round_small")
                @viewData.display_name          = @user.get("display_name")

                @render()
