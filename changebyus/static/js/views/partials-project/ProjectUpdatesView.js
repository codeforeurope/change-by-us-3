define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectUpdateFormView", "views/partials-project/ProjectUpdateListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectUpdateFormView, ProjectUpdateListItemView) {
  var ProjectUpdatesView;
  return ProjectUpdatesView = ProjectSubView.extend({
    parent: "#project-update",
    render: function() {
      var _this = this;
      this.$el = $("<div class='project'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-updates.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var form;
      this.$el.find(".preload").remove();
      this.$ul = this.$el.find(".updates-container ul");
      return form = new ProjectUpdateFormView({
        parent: this.$el
      });
    },
    addOne: function(model_) {
      var view;
      view = new ProjectUpdateListItemView({
        model: model_
      });
      return this.$ul.append(view.render().$el);
    }
  });
});
