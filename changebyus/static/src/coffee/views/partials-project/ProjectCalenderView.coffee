define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], (_, Backbone, $, temp, ProjectSubView) ->
  ProjectCalenderView = ProjectSubView.extend(
    parent: "#project-calendar"
    render: ->
      self = this
      @$el = $("<div class='project'/>")
      @$el.template @templateDir + "/templates/partials-project/project-calendar.html",
        data: @viewData
      , ->
        self.$el.find(".preload").remove()

      $(@parent).append @$el

    
    #console.log($(this.parent),this.$el);
    addOne: (model) ->
  )
  
  #to do 
  #var view = new Partial(); 
  #this.$el.append(view);
  ProjectCalenderView

