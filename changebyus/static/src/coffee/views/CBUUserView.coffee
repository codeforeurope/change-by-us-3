define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "abstract-view", 
        "model/UserModel", 
        "collection/ProjectListCollection", 
        "resource-project-view"],
    (_, 
     Backbone,
     $,
     temp,
     AbstractView,
     UserModel,
     ProjectListCollection,
     ResourceProjectPreviewView) ->
        CBUUserView = AbstractView.extend

            joinedProjects:null
            ownedProjects:null

            initialize: (options_) ->
                options = options_
                AbstractView::initialize.call @, options

                @model = new UserModel(options.model)
                @model.fetch success: =>
                    @render()

            events:
                "click .flag-user a":"flagUser"

            render: ->
                @$el = $("<div class='user'/>")
                @$el.template @templateDir+"/templates/partials-user/user.html",
                    data: @model.attributes, => @onTemplateLoad()
                $(@parent).append @$el

            onTemplateLoad:->
                if (@model.id is window.userID)
                    $('.edit').removeClass('invisible')
                    $('.flag-user').remove()
                    
                @loadProjects()
                
                AbstractView::onTemplateLoad.call @

            loadProjects:->
                @joinedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/joined-projects"})
                @joinedProjects.on "reset", @addJoined, @
                @joinedProjects.fetch reset: true

                @ownedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/owned-projects"})
                @ownedProjects.on "reset", @addOwned, @
                @ownedProjects.fetch reset: true

            flagUser:(e)->
                e.preventDefault()
                $.post "/api/user/#{@model.id}/flag", (res_)=>
                    $('.flag-user').css('opacity',0.25)
                    console.log res_

            addJoined:->
                @joinedProjects.each (projectModel) => @addOne projectModel, "#following-list"

            addOwned:->
                @ownedProjects.each (projectModel) => @addOne projectModel, "#project-list"

            addOne: (projectModel_, parent_) ->
                view = new ResourceProjectPreviewView(model: projectModel_)
                view.render()

                @$el.find(parent_).append view.$el