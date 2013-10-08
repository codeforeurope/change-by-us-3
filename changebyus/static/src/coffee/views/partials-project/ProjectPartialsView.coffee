define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  ProjectPartialsView = AbstractView.extend

    initialize: (options) ->
      AbstractView::initialize.apply this, options
      @render()

    render: ->
      @$el = $("<li class='project-preview'/>")
      @$el.template @templateDir + "/templates/partials-universal/project.html", {data: @model.attributes}, =>
        console.log 'done'

