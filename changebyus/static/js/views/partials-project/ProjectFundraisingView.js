define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectFundraisingView;
  ProjectFundraisingView = AbstractView.extend({
    parent: "#project-calendar",
    initialize: function(options) {
      AbstractView.prototype.initialize.apply(this, options);
      return this.render();
    },
    render: function() {
      this.$el = $("<div class='project'/>");
      if (this.started) {
        this.$el.template(this.templateDir + "/templates/partials-project/project-fundraising-goals.html", {
          data: this.viewData
        }, function() {});
      } else {
        this.$el.template(this.templateDir + "/templates/partials-project/project-fundraising-get-started.html", {}, function() {});
      }
      return $(this.parent).append(this.$el);
    }
  });
  return ProjectFundraisingView;
});
