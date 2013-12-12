define(["underscore", "backbone", "jquery", "template", "abstract-modal-view"], function(_, Backbone, $, temp, AbstractModalView) {
  var ProjectCreateModalView;
  return ProjectCreateModalView = AbstractModalView.extend({
    render: function() {
      var _this = this;
      this.$el = $("<div class='modal-fullscreen dark'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-create-modal.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    }
  });
});
