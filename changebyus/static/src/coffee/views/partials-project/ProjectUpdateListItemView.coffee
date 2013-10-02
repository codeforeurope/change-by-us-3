define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
  ProjectUpdateListItemView = AbstractView.extend(
    tagName: "li"
    render: ->
      $(@el).template @templateDir + "/templates/partials-project/project-update-list-item.html",
        data: @model.attributes
      , ->

      this
  )
  ProjectUpdateListItemView

