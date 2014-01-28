define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "resource-project-view", 
        "views/partials-project/ProjectMemberListItemView", 
        "collection/FlaggedProjectCollection", 
        "collection/FlaggedUserCollection", 
        "collection/UnapprovedResourcesCollection", 
        "abstract-view"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     ResourceProjectPreviewView,
     ProjectMemberListItemView, 
     FlaggedProjectCollection, 
     FlaggedUserCollection, 
     UnapprovedResourcesCollection,
     AbstractView) ->

        CBUAdminView = AbstractView.extend

            initialize: (options_) ->
                options = options_
                AbstractView::initialize.call @, options
                
                @flaggedProjects     = options.flaggedProjects or new FlaggedProjectCollection()
                @flaggedUsers        = options.flaggedUsers or new FlaggedUserCollection()
                @unapprovedResources = options.unapprovedResources or new UnapprovedResourcesCollection()
                
                @render()

            render: -> 
                @$el = $("<div class='body-container'/>")
                @$el.template @templateDir+"/templates/admin.html",
                    {data: @viewData}, => @onTemplateLoad()
                $(@parent).append @$el

            buttonCheck:->
                if @flaggedProjects.length is 0 then @$projectsBTN.hide() else @$projectsBTN.show()
                if @flaggedUsers.length is 0 then @$usersBTN.hide() else @$usersBTN.show()
                if @unapprovedResources.length is 0 then @$resourcesBTN.hide() else @$resourcesBTN.show()

            onTemplateLoad:->
                @$projects     = $("#flagged-projects")
                @$users        = $("#flagged-users")
                @$resources    = $("#approved-resource")
                
                @$projectsBTN  = $("#projects-btn")
                @$usersBTN     = $("#users-btn")
                @$resourcesBTN = $("#resources-btn")

                @flaggedProjects.on "reset", @addProjects, @
                @flaggedProjects.on "remove", @buttonCheck, @
                @flaggedProjects.fetch reset: true

                @flaggedUsers.on "reset", @addUsers, @
                @flaggedUsers.on "remove", @buttonCheck, @
                @flaggedUsers.fetch reset: true 

                @unapprovedResources.on "reset", @addResources, @
                @unapprovedResources.on "remove", @buttonCheck, @
                @unapprovedResources.fetch reset: true 

                $(window).bind "hashchange", (e) => @toggleSubView()
                @toggleSubView()

                AbstractView::onTemplateLoad.call @

            addProjects: ->
                @buttonCheck()
                @flaggedProjects.each (projectModel_) =>
                    @addProject projectModel_

            addProject: (projectModel_) ->
                view = new ResourceProjectPreviewView({model:projectModel_, isAdmin:true})
                view.render()

                $("#projects-list").append view.$el

            addUsers: ->  
                @buttonCheck()
                @flaggedUsers.each (userModel_) =>
                    @addUser userModel_

            addUser: (userModel_) -> 
                view = new ProjectMemberListItemView({model:userModel_, isAdmin:true}) 
                view.render()

                $("#users-list").append view.$el

            addResources: ->  
                @buttonCheck()
                @unapprovedResources.each (resourceModel_) =>
                    @addResource resourceModel_

            addResource: (resourceModel_) -> 
                view = new ResourceProjectPreviewView({model:resourceModel_, isAdmin:true}) 
                view.render()

                $("#resource-list").append view.$el

            toggleSubView: -> 
                @currentView = window.location.hash.substring(1)
                onPageElementsLoad()

                for v in [@$projects,@$users,@$resources]
                    v.hide()

                for btn in [@$projectsBTN,@$usersBTN,@$resourcesBTN]
                    btn.removeClass "active"

                switch @currentView 
                    when "users"
                        @$users.show() 
                        @$usersBTN.addClass "active"
                    when "resources" 
                        @$resources.show() 
                        @$resourcesBTN.addClass "active"
                    else 
                        @$projects.show()
                        @$projectsBTN.addClass "active"