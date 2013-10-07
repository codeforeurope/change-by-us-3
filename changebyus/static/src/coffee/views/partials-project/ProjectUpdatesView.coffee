define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectUpdateFormView", "views/partials-project/ProjectUpdateListItemView"], (_, Backbone, $, temp, ProjectSubView, ProjectUpdateFormView, ProjectUpdateListItemView) ->
  ProjectUpdatesView = ProjectSubView.extend(
    parent: "#project-update"
    render: ->
      self = this
      @$el = $("<div class='project'/>")
      @$el.template @templateDir + "/templates/partials-project/project-updates.html",
        data: @viewData
      , ->
        self.$el.find(".preload").remove()
        
        # temp here for now
        form = new ProjectUpdateFormView(parent: self.$el)

      $(@parent).append @$el

    addOne: (model) ->
      console.log "model", model
      view = new ProjectUpdateListItemView(model: model)
      @$el.find(".project-container ul").append view.el
  )
  ProjectUpdatesView

