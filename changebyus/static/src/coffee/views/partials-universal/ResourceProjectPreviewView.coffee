define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
    (_, Backbone, $, temp, AbstractView) ->
        ResourceProjectPreviewView = AbstractView.extend

            isProject:false
            isResource:false
            isOwned:false
            isFollowed:false
            isAdmin:false

            initialize: (options_) ->
                options              = options_
                AbstractView::initialize.call @, options
                @viewData            = @model.attributes
                @viewData.isProject  = options.isProject || @isProject
                @viewData.isOwned    = options.isOwned || @isOwned
                @viewData.isFollowed = options.isFollowed || @isFollowed
                @viewData.isAdmin    = options.isAdmin || @isAdmin

            events: 
                "click .close-x": "close"
                "click .btn-tertiary": "unflag"
                "click .btn-warning": "delete"

            render: ->
                @$el = $("<li class='project-preview'/>")
                @$el.template @templateDir+"/templates/partials-universal/project-resource.html",
                    {data: @viewData}, => 
                        @onTemplateLoad()
                        @$el.find('img').hide().load -> 
                            $(this).fadeIn('slow')
                            onPageElementsLoad()
                            
            ### EVENTS ---------------------------------------------###
            onFetch:(r)-> 
                $(@parent).append @render() 

            close:(e)->
                $closeX = $(e.currentTarget)
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

            delete:(e)-> 
                e.preventDefault()
                $.ajax(
                    type: "DELETE"
                    url: "/api/project/#{@model.id}"
                ).done (res_)=>
                    if res_.success
                        @model.collection.remove @model
                        @$el.remove() 

            unflag:(e)-> 
                e.preventDefault()
                $.post "/api/project/#{@model.id}/unflag", (res_)=>
                    if res_.success
                        @model.collection.remove @model
                        @$el.remove() 
