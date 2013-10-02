define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  ProjectSubView = AbstractView.extend(
    isDataLoaded: false
    initialize: (options) ->
      AbstractView::initialize.apply this, options
      @render()

    show: ->
      @$el.show()
      unless @isDataLoaded
        @collection.on "reset", @addAll, this
        @collection.fetch reset: true

    loadData: ->

    
    # override in subview
    addOne: (model) ->

    
    # override in subview
    addAll: ->
      self = this
      @collection.each (model) ->
        self.addOne model

      @isDataLoaded = true
  )
  ProjectSubView

