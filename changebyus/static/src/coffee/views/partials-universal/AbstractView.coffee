define ["underscore", "backbone", "jquery", "template"], (_, Backbone, $, temp) ->
  AbstractView = Backbone.View.extend(
    parent: "body"
    templateDir: "/static"
    viewData: {}
    initialize: (options_) ->
      options = options_ or {}
      @templateDir = options.templateDir or @templateDir
      @parent = options.parent or @parent
      @viewData = options.viewData or @viewData

    
    # console.log("initialize",options,this);
    show: ->
      @$el.show()

    hide: ->
      @$el.hide()
  )
  AbstractView

