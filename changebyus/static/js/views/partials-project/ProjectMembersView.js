define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectMemberListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectMemberListItemView) {
  var ProjectMembersView;
  ProjectMembersView = ProjectSubView.extend({
    parent: "#project-members",
    $teamList: null,
    $memberList: null,
    render: function() {
      var self;
      self = this;
      this.$el = $("<div class='project'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-members.html", {}, function() {
        self.$el.find(".preload").remove();
        self.$teamList = self.$el.find("#team-members ul");
        return self.$memberList = self.$el.find("#project-members ul");
      });
      return $(this.parent).append(this.$el);
    },
    addOne: function(model) {
      var view;
      view = new ProjectMemberListItemView({
        model: model
      });
      return this.$teamList.append(view.el);
    }
  });
  return ProjectMembersView;
});
