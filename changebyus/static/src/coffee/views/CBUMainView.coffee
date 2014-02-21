define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "form", 
        "resource-project-view", 
        "views/partials-homepage/BannerImageView", 
        "collection/ProjectListCollection", 
        "collection/ResourceListCollection", 
        "abstract-view"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     form, 
     ResourceProjectPreviewView, 
     BannerImageView, 
     ProjectListCollection, 
     ResourceListCollection, 
     AbstractView) ->

        CBUMainView = AbstractView.extend

            initialize: (options_) ->
                AbstractView::initialize.call @, options_

                options             = options_ 
                @collection         = options.collection or new ProjectListCollection()
                @resourceCollection = options.resourceCollection or new ResourceListCollection()
                @render()

            render: -> 
                @$el = $("<div class='projects-main'/>")
                @$el.template @templateDir+"main.html",
                    {}, => @onTemplateLoad()
                $(@parent).prepend @$el

            onTemplateLoad:->
                bannerParent = @$el.find(".body-container-wide")
                bannerImageView = new BannerImageView({parent:bannerParent})
                
                @addListeners()

                AbstractView::onTemplateLoad.call @

            addListeners:->
                @collection.on "reset", @addAll, @
                @collection.fetch reset: true

                @resourceCollection.on "reset", @addAllResources, @
                @resourceCollection.fetch reset: true

            addAll: ->  
                @collection.each (projectModel_) => 
                    @addProject projectModel_
                onPageElementsLoad() 

            addProject: (projectModel_) ->
                view = new ResourceProjectPreviewView(model: projectModel_)
                view.render()
                
                @$el.find("#project-list").append view.$el

            addAllResources: ->
                @resourceCollection.each (projectModel_) => 
                    @addResource projectModel_
                onPageElementsLoad() 

            addResource: (projectModel_) ->
                view = new ResourceProjectPreviewView(model: projectModel_)
                view.render()

                @$el.find("#resource-list").append view.$el