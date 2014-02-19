define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
    (_, Backbone, $, temp, AbstractView) ->
        ResourceProjectPreviewView = AbstractView.extend

            isProject:false
            isResource:false
            isOwned:false
            isFollowed:false
            isAdmin:false
            isDiscovered:false

            initialize: (options_) ->
                options              = options_
                AbstractView::initialize.call @, options
                @viewData              = @model.attributes
                @viewData.isProject    = options.isProject || @isProject
                @viewData.isOwned      = options.isOwned || @isOwned
                @viewData.isFollowed   = options.isFollowed || @isFollowed
                @viewData.isAdmin      = options.isAdmin || @isAdmin 
                @viewData.isDiscovered = options.isDiscovered || @isDiscovered 

            events: 
                "click .close-x": "close"
                "click .unflag": "unflag"
                "click .delete-project": "delete"
                "click .approve": "approve"
                "click .reject": "reject"

            render: ->
                @$el = $("<li class='project-preview'/>")
                @$el.template @templateDir+"partials-universal/project-resource.html",
                    {data: @viewData}, =>
                        @delegateEvents()
                        @$el.find('img').hide().load =>
                            @$el.find('img').fadeIn('slow')
                            @onTemplateLoad()
                            
            ### EVENTS ---------------------------------------------###
            onFetch:(r)-> 
                $(@parent).append @render()  

            close:(e)-> 
                confirmation = confirm("Do you really want to leave this project?")
                if confirmation
                    $closeX = $(".close-x")
                    $closeX.hide()

                    dataObj = {project_id:@model.id}
                    $.ajax(
                        type: "POST"
                        url: "/api/project/leave"
                        data: JSON.stringify(dataObj) 
                        dataType: "json" 
                        contentType: "application/json; charset=utf-8"
                    ).done (response_)=>
                        if response_.success
                            @model.collection.remove @model
                            @$el.remove() 
                        else
                            $closeX.show()

            unflag:(e)-> 
                e.preventDefault()
                $.post "/api/project/#{@model.id}/unflag", (res_)=> @onResponce res_

            delete:(e)-> 
                e.preventDefault()
                confirmation = confirm("Are you sure you want to delete #{@model.get('name')}?")
                if confirmation
                    $.ajax(
                        type: "DELETE"
                        url: "/api/project/#{@model.id}"
                    ).done (res_)=> @onResponce res_

            approve:(e)-> 
                e.preventDefault()
                confirmation = confirm("Are you sure you want to approve #{@model.get('name')}?")
                if confirmation
                    $.post "/api/resource/#{@model.id}/approve", (res_)=> @onResponce res_

            reject:(e)-> 
                e.preventDefault()
                confirmation = confirm("Are you sure you want to reject #{@model.get('name')}?")
                if confirmation
                    $.ajax(
                        type: "DELETE"
                        url: "/api/resource/#{@model.id}"
                    ).done (res_)=> @onResponce res_
                        
            onResponce:(res_)->
                if res_.success
                    @model.collection.remove @model
                    @$el.remove() 

