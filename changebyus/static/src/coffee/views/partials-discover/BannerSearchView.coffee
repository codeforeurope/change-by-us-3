define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  BannerSearchView = AbstractView.extend(
    initialize: (options) ->
      AbstractView::initialize.apply this, options
      @render()

    render: ->
      
      #var self = this;
      @$el = $("<div class='banner-search'/>")
      @$el.template @templateDir + "/templates/partials-discover/banner-search.html",
        data: @viewData
      , ->

      $(@parent).append @$el
  )
  BannerSearchView

