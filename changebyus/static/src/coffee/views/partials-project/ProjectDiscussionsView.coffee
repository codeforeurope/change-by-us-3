define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], (_, Backbone, $, temp, ProjectSubView) ->
  ProjectDiscussionsView = ProjectSubView.extend
    parent: "#project-update"
    render: ->
      @$el = $("<div class='project'/>")
      $(@parent).append @$el

    addAll: ->
      if @collection.length is 0
        @$el.template @templateDir + "/templates/partials-project/project-zero-discussions.html", 
          {}, =>

      else
        @$el.template @templateDir + "/templates/partials-project/project-all-discussions.html",
          {data:@viewData}, =>

