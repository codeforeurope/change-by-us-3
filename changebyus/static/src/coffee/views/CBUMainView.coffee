define ["underscore", "backbone", "jquery", "template", "form", "views/partials-project/ProjectPartialsView", "views/partials-homepage/BannerImageView", "collection/ProjectListCollection"], 
(_, Backbone, $, temp, form, ProjectPartialsView, BannerImageView, ProjectListCollection) ->
  
  CBUMainView = Backbone.View.extend(
    parent: "body"
    templateDir: "/static"
    viewData: {}
    collection: {}
    
    initialize: (options) ->
      @templateDir = options.templateDir or @templateDir
      @parent      = options.parent or @parent
      @viewData    = options.viewData or @viewData
      @collection  = options.collection or new ProjectListCollection()
      @render()

    render: ->
      self = this
      @$el = $("<div class='projects-main'/>")
      @$el.template @templateDir + "/templates/main.html", {}, ->
        $(self.parent).prepend self.$el
        bannerParent = self.$el.find(".body-container-wide")
        bannerImageView = new BannerImageView(parent: bannerParent)
        self.collection.on "reset", self.addAll, self
        self.collection.fetch reset: true
        self.ajaxForm()

    ajaxForm: ->
      
      # AJAXIFY THE SIGNUP FORM
      $signup = $("form[name=signup]")
      $signup.ajaxForm (response) ->
        console.log response

      
      # AJAXIFY THE SIGNIN FORM
      $signin = $("form[name=signin]")
      $signin.ajaxForm (response) ->
        console.log response


    addOne: (projectModel) ->
      view = new ProjectPartialsView(model: projectModel)
      @$el.find("#project-list").append view.el

    addAll: ->
      self = this
      @collection.each (projectModel) ->
        self.addOne projectModel

  )
  CBUMainView

