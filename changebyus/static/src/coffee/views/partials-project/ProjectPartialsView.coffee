define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  ProjectPartialsView = AbstractView.extend(
    tagName: "li"
    initialize: (options) ->
      AbstractView::initialize.apply this, options
      @render()

    render: ->
      $el = $("<div class='project-preview'/>")
      $el.template @templateDir + "/templates/partials-universal/project.html",
        data: @model.attributes
      , ->

      @el = $el
  )
  ProjectPartialsView

