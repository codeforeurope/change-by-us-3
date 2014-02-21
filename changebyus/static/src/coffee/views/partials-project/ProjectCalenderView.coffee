define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "abstract-view"
        "views/partials-project/ProjectSubView", 
        "views/partials-project/ProjectEmbedCalendarModalView"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     AbstractView,
     ProjectSubView, 
     ProjectEmbedCalendarModalView) ->

        ProjectCalenderView = ProjectSubView.extend
            isOwner: false
            isOrganizer: false
            parent: "#project-calendar"
            view: "public" 
            
            initialize: (options_) ->  
                options               = options_ or {}
                @id                   = options.id or @id
                @templateDir          = options.templateDir or @templateDir
                @parent               = options.parent or @parent 
                
                if @model
                    @viewData             = @model.attributes || @viewData
                    @viewData.isOwner     = options.isOwner || @isOwner
                    @viewData.isOrganizer = options.isOrganizer || @isOrganizer
                    @viewData.view        = options.view || @view

                @render()

            events:
                "click #embed-calendar":"onEmbedCalendar"
                "click #delete-calendar":"onDeleteCalendar"
                
            render: ->  
                @$el = $(@parent)
                @$el.template @templateDir+"partials-project/project-calendar.html",
                    {data: @viewData}, => @onTemplateLoad()
                    
            onTemplateLoad:->
                @$el.find(".preload").remove()
                ProjectSubView::onTemplateLoad.call @

            # EVENTS
            # ----------------------------------------------------------------------
            onEmbedCalendar:(e)->
                e.preventDefault()
                
                @projectEmbedCalendarModalView = new ProjectEmbedCalendarModalView({model:@model})

            onDeleteCalendar:(e)->
                e.preventDefault() 

                url = "/api/project/#{@model.id}/delete_calendar"
                $.get url, (response_) ->
                    if response_.success then window.location.reload() 