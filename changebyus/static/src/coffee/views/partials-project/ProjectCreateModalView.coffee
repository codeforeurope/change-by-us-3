define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  ProjectCreateModalView = AbstractView.extend
  
    initialize: (options) ->
      AbstractView::initialize.call @, options
      @render()

    render: ->
      @$el = $("<div class='project-preview'/>")
      @$el.template @templateDir + "/templates/partials-project/project-create-modal.html",
        data: @viewData
      , ->

      $(@parent).append @$el 

