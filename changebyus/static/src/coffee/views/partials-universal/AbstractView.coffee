define ["underscore", "backbone", "jquery", "template"], (_, Backbone, $, temp) ->
  AbstractView = Backbone.View.extend
    
    parent: "body"
    templateDir: "/static"
    viewData: {}
    id:0

    initialize: (options_) ->
      options      = options_ or {}
      @id          = options.id or @id
      @templateDir = options.templateDir or @templateDir
      @parent      = options.parent or @parent
      @viewData    = options.viewData or @viewData
      console.log 'options_',options.parent,@parent
    
    show: ->
      @$el.show()

    hide: ->
      @$el.hide()