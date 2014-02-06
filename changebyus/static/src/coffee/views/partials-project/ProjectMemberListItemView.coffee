define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
    (_, Backbone, $, temp, AbstractView) ->
        ProjectMemberListItemView = AbstractView.extend
            
            tagName: "li"
            view:"public"
            projectID:0
            isAdmin:false

            initialize: (options_) -> 
                AbstractView::initialize.call @, options_ 

                @view             = options_.view || @view
                @projectID        = options_.projectID || @projectID
                @viewData         = @model.attributes
                @viewData.isAdmin = options_.isAdmin || @isAdmin
                @viewData.view    = @view
                @viewData.sid     = Math.random().toString(20).substr(2)

                @render()

            events: 
                "click .delete-x": "removeUser"
                "click .btn-tertiary": "unflag"
                "click .btn-warning": "delete"

            render: ->
                @$el = $(@el)
                @$el.template @templateDir+"/templates/partials-project/project-member-list-item.html",
                    {data:@viewData}, => @onTemplateLoad()
                    
            onTemplateLoad:-> 
                if (@view is "admin")
                    delay 1, => @addDropKick()

                AbstractView::onTemplateLoad.call @

            addDropKick:->
                $("#"+@viewData.sid).dropkick
                    change: (value_, label_) =>
                        $.ajax(
                            type: "POST"
                            url: "/api/project/change-user-role"
                            data: { project_id:@projectID, user_id:@model.id, user_role:value_}
                        ).done (response_)=>
                            if (response_.success)
                                @model.set('roles', [value_])

            removeUser:->
                dataObj = { project_id:@projectID, user_id:@model.id}
                $.ajax(
                    type: "POST"
                    url: "/api/project/remove-member"
                    data: JSON.stringify(dataObj) 
                    dataType: "json" 
                    contentType: "application/json; charset=utf-8"
                ).done (response_)=>
                    if (response_.success)
                        @model.collection.remove @model
                        @$el.remove() 

            ### EVENTS ---------------------------------------------###
            delete:(e)-> 
                e.preventDefault()
                confirmation = confirm("Are you sure you want to delete #{@model.get('display_name')}: #{@model.get('first_name')} #{@model.get('last_name')}?")
                if confirmation
                    $.ajax(
                        type: "DELETE"
                        url: "/api/user/#{@model.id}"
                    ).done (res_)=>
                        if res_.success
                            @model.collection.remove @model
                            @$el.remove() 

            unflag:(e)-> 
                e.preventDefault()
                $.post "/api/user/#{@model.id}/unflag", (res_)=>
                    if res_.success
                        @model.collection.remove @model
                        @$el.remove() 