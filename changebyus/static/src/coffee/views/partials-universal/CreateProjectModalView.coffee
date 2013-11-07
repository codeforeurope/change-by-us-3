define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  CreateProjectModalView = AbstractView.extend
  
    initialize: (options) ->
      AbstractView::initialize.call @, options
      @render()

    render: ->
      @$el = $("<div class='project-preview'/>")
      @$el.template @templateDir + "/templates/partials-universal/create-project-modal.html",
        data: @viewData
      , ->

      $(@parent).append @$el 

