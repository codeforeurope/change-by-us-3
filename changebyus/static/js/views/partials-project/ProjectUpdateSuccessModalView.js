define(["underscore", "backbone", "jquery", "template", "abstract-modal-view"], function(_, Backbone, $, temp, AbstractModalView) {
  var ProjectUpdateSuccessModalView;
  return ProjectUpdateSuccessModalView = AbstractModalView.extend({
    render: function() {
      var _this = this;
      this.$el = $("<div class='modal-fullscreen dark'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-share-success-modal.html", {
        data: this.model
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    }
  });
});
