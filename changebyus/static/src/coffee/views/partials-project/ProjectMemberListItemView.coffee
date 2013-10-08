define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  ProjectMemberListItemView = AbstractView.extend
    
    tagName: "li"

    initialize: (options) ->
      AbstractView::initialize.apply this, options
      @render()

    render: ->
      $(@el).template @templateDir + "/templates/partials-project/project-member-list-item.html",
        {data: @model.attributes}, ->
      @

