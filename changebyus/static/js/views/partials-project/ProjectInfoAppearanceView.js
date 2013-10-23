define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectInfoAppearanceView;
  return ProjectInfoAppearanceView = AbstractView.extend({
    parent: "#project-info",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div />");
      this.$el.template(this.templateDir + "/templates/partials-project/project-info-appearance.html", {
        data: this.viewData
      }, function() {});
      return $(this.parent).append(this.$el);
    }
  });
});
