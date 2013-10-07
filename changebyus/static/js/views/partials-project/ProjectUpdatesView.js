define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectUpdateFormView", "views/partials-project/ProjectUpdateListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectUpdateFormView, ProjectUpdateListItemView) {
  var ProjectUpdatesView;
  ProjectUpdatesView = ProjectSubView.extend({
    parent: "#project-update",
    render: function() {
      var self;
      self = this;
      this.$el = $("<div class='project'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-updates.html", {
        data: this.viewData
      }, function() {
        var form;
        self.$el.find(".preload").remove();
        return form = new ProjectUpdateFormView({
          parent: self.$el
        });
      });
      return $(this.parent).append(this.$el);
    },
    addOne: function(model) {
      var view;
      console.log("model", model);
      view = new ProjectUpdateListItemView({
        model: model
      });
      return this.$el.find(".project-container ul").append(view.el);
    }
  });
  return ProjectUpdatesView;
});
