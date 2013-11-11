define ["underscore", "backbone", "jquery", "template", "views/partials-discover/BannerSearchView", "views/partials-project/ProjectPartialsView", "collection/ProjectListCollection"], 
  (_, Backbone, $, temp, BannerSearchView, ProjectPartialsView, ProjectListCollection) ->
    CBUDiscoverView = Backbone.View.extend
      parent: "body"
      templateDir: "/static"
      viewData: {}
      bannerSearchView: null 
        
      initialize: (options) ->
        # this is added later
        @templateDir = options.templateDir or @templateDir
        @parent      = options.parent or @parent
        @viewData    = options.viewData or @viewData
        @collection  = options.collection or new ProjectListCollection()
        @render()

      render: -> 
        @$el = $("<div class='discover'/>")
        @$el.template @templateDir + "/templates/discover.html",
          data: @viewData, =>
            $(@parent).append @$el
            searchParent = @$el.find(".content")
            bannerSearchView = new BannerSearchView({parent:searchParent})
            @collection.on "reset", @addAll, @
            @collection.fetch reset: true


      addOne: (projectModel) ->
        view = new ProjectPartialsView({model:projectModel})
        @$el.find("#project-list").append view.el

      addAll: -> 
        @collection.each (projectModel) =>
          @addOne projectModel

        if (@collection.length is 0)
          @$el.template @templateDir + "/templates/partials-discover/no-results.html",
            data: @viewData, =>