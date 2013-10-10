define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], function(_, Backbone, $, temp, ProjectSubView) {
  var ProjectDiscussionsView;
  return ProjectDiscussionsView = ProjectSubView.extend({
    parent: "#project-update",
    render: function() {
      return this.$el = $(this.parent);
    },
    addAll: function() {
      var _this = this;
      console.log('ProjectDiscussionsView addAll');
      if (this.collection.length === 0) {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-zero-discussions.html", {}, function() {});
      } else {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-all-discussions.html", {
          data: this.viewData
        }, function() {});
      }
    }
  });
});
