define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], function(_, Backbone, $, temp, ProjectSubView) {
  var ProjectDiscussionView;
  ProjectDiscussionView = ProjectSubView.extend({
    render: function() {
      this.$el = $("<div class='project'/>");
      return $(this.parent).append(this.$el);
    },
    addOne: function(model) {
      var view;
      view = $("<div/>");
      view.template(this.templateDir + "/templates/partials-project/project-discussion.html", {
        data: this.viewData
      }, function() {});
      return this.$el.append(view);
    }
  });
  return ProjectDiscussionView;
});
