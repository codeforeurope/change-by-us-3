define ["underscore", "backbone", "jquery", "template", "views/partials-discover/BannerSearchView", "views/partials-project/ProjectPartialsView", "collection/ProjectListCollection"], (_, Backbone, $, temp, BannerSearchView, ProjectPartialsView, ProjectListCollection) ->
  CBUDiscoverView = Backbone.View.extend(
    parent: "body"
    templateDir: "/static"
    viewData: {}
    bannerSearchView: null
    initialize: (options) ->
      
      # this is added later
      @templateDir = options.templateDir or @templateDir
      @parent = options.parent or @parent
      @viewData = options.viewData or @viewData
      @collection = options.collection or new ProjectListCollection()
      @render()

    render: ->
      self = this
      @$el = $("<div class='discover'/>")
      @$el.template @templateDir + "/templates/discover.html",
        data: @viewData
      , ->
        $(self.parent).append self.$el
        searchParent = self.$el.find(".content")
        bannerSearchView = new BannerSearchView(parent: searchParent)
        self.collection.on "reset", self.addAll, self
        self.collection.fetch reset: true


    addOne: (projectModel) ->
      view = new ProjectPartialsView(model: projectModel)
      @$el.find("#project-list").append view.el

    addAll: ->
      self = this
      @collection.each (projectModel) ->
        self.addOne projectModel

  )
  CBUDiscoverView

