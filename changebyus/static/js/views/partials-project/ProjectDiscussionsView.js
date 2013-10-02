define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], function(_, Backbone, $, temp, ProjectSubView) {
  var ProjectDiscussionsView;
  ProjectDiscussionsView = ProjectSubView.extend({
    parent: "#project-update",
    render: function() {
      this.$el = $("<div class='project'/>");
      return $(this.parent).append(this.$el);
    },
    addAll: function() {
      if (this.collection.length === 0) {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-zero-discussions.html", {}, function() {});
      } else {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-all-discussions.html", {
          data: this.viewData
        }, function() {});
      }
    }
  });
  return ProjectDiscussionsView;
});
