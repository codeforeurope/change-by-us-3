define ["underscore", "backbone", "jquery", "template", "abstract-view"],
  (_, Backbone, $, temp, AbstractView) ->
    ProjectInfoAppearanceView = AbstractView.extend
      
      parent: "#project-info"

      initialize: (options) ->
        AbstractView::initialize.call @, options
        @render()

      render: ->
        @$el = $("<div />")
        @$el.template @templateDir + "/templates/partials-project/project-info-appearance.html",
          data: @viewData, =>

        $(@parent).append @$el 

