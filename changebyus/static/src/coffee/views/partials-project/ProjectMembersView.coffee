define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectMemberListItemView"], (_, Backbone, $, temp, ProjectSubView, ProjectMemberListItemView) ->
  ProjectMembersView = ProjectSubView.extend
  
    parent: "#project-members"
    $teamList: null
    $memberList: null

    render: ->
      self = this
      @$el = $("<div class='project'/>")
      
      # data:this.viewData
      @$el.template @templateDir + "/templates/partials-project/project-members.html", {}, ->
        self.$el.find(".preload").remove()
        self.$teamList = self.$el.find("#team-members ul")
        self.$memberList = self.$el.find("#project-members ul")

      $(@parent).append @$el

    addOne: (model) ->
      #to do 
      view = new ProjectMemberListItemView(model: model)
      @$teamList.append view.el
