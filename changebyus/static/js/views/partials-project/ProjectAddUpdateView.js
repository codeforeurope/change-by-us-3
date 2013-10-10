define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectUpdateFormView"], function(_, Backbone, $, temp, AbstractView, ProjectUpdateFormView) {
  var ProjectAddUpdateView;
  return ProjectAddUpdateView = AbstractView.extend({
    parent: "#project-update",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-project/project-add-update.html", {
        data: this.viewData
      }, function() {
        var form, updateDiv;
        updateDiv = _this.$el.find("#update-form");
        return form = new ProjectUpdateFormView({
          parent: updateDiv
        });
      });
    }
  });
});
