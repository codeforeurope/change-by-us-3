define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  ProjectAddUpdateView = AbstractView.extend

    parent: "#project"
   
    initialize: (options) ->
      AbstractView::initialize.apply this, options
      @render()

    render: -> 
      @$el = $("<div class='project'/>")
      @$el.template @templateDir + "/templates/partials-project/project-add-update.html",
        {data: @viewData}, =>@ajaxForm()

      $(@parent).append @$el

    ajaxForm: ->
      $signin = $("form[name=add-update]")
      $signin.ajaxForm (response) ->