define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  ProjectInfoAppearanceView = AbstractView.extend(
    parent: "#project-calendar"
    initialize: (options) ->
      AbstractView::initialize.apply this, options
      @render()

    render: ->
      @$el = $("<div class='project'/>")
      @$el.template @templateDir + "/templates/partials-project/project-info-appearance.html",
        data: @viewData
      , ->

      $(@parent).append @$el
  )
  ProjectInfoAppearanceView

