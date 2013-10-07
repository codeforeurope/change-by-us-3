define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectPartialsView;
  ProjectPartialsView = AbstractView.extend({
    tagName: "li",
    initialize: function(options) {
      AbstractView.prototype.initialize.apply(this, options);
      return this.render();
    },
    render: function() {
      var $el;
      $el = $("<div class='project-preview'/>");
      $el.template(this.templateDir + "/templates/partials-universal/project.html", {
        data: this.model.attributes
      }, function() {});
      return this.el = $el;
    }
  });
  return ProjectPartialsView;
});
