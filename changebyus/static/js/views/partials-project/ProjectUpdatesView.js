define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectUpdateListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectUpdateListItemView) {
  var ProjectUpdatesView;
  return ProjectUpdatesView = ProjectSubView.extend({
    parent: "#project-update",
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-project/project-updates.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      return this.$ul = this.$el.find(".updates-container ul");
    },
    noResults: function() {},
    addOne: function(model_) {
      var view;
      view = new ProjectUpdateListItemView({
        model: model_
      });
      return this.$ul.append(view.render().$el);
    }
  });
});
