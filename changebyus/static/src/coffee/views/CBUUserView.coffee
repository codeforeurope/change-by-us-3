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
                "click #flag":"flagUser"

            render: ->
                if @model.get('active')
                    @$el = $("<div class='user'/>")
                    @$el.template @templateDir+"partials-user/user.html",
                        {data: @model.attributes}, => @onTemplateLoad()
                    $(@parent).append @$el
                else
                    @$el = $("<div class='user'/>")
                    @$el.template @templateDir+"partials-user/not-found.html",
                        {}, => @onTemplateLoad()
                    $(@parent).append @$el

            onTemplateLoad:->
                if (@model.id is window.userID)
                    $('.edit').removeClass('invisible')
                    $('.flag-user').remove()
                    
                @loadProjects()
                
                AbstractView::onTemplateLoad.call @

            loadProjects:-> 
                @joinedProjects = new ProjectListCollection()
                @joinedProjects.url = "/api/project/user/#{@model.id}/joined-projects"
                @joinedProjects.on "reset", @addJoined, @
                @joinedProjects.fetch reset: true
 
                @ownedProjects = new ProjectListCollection()
                @ownedProjects.url = "/api/project/user/#{@model.id}/owned-projects"
                @ownedProjects.on "reset", @addOwned, @
                @ownedProjects.fetch reset: true

            flagUser:(e)->
                e.preventDefault()
                $.post "/api/user/#{@model.id}/flag", (res_)=>
                    $('.flag-user').addClass('disabled-btn')
                    @$el.unbind "click #flag"

            addJoined:->
                if @joinedProjects.length is 0
                    $('.user-following').hide()
                else
                    @joinedProjects.each (projectModel) => @addOne projectModel, "#following-list"

            addOwned:-> 
                if @ownedProjects.length is 0
                    $('.user-projects').hide()
                else 
                    @ownedProjects.each (projectModel) => @addOne projectModel, "#project-list"

            addOne: (projectModel_, parent_) ->
                view = new ResourceProjectPreviewView(model: projectModel_)
                view.render()

                @$el.find(parent_).append view.$el