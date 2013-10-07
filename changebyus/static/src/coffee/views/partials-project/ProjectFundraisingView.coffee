define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  ProjectFundraisingView = AbstractView.extend(
    parent: "#project-calendar"
    initialize: (options) ->
      AbstractView::initialize.apply this, options
      @render()

    render: ->
      @$el = $("<div class='project'/>")
      if @started
        @$el.template @templateDir + "/templates/partials-project/project-fundraising-goals.html",
          data: @viewData
        , ->

      else
        @$el.template @templateDir + "/templates/partials-project/project-fundraising-get-started.html", {}, ->

      $(@parent).append @$el
  )
  ProjectFundraisingView

