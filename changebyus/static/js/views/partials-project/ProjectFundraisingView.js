define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectFundraisingView;
  return ProjectFundraisingView = AbstractView.extend({
    parent: "#project-calendar",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      if (this.started) {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-fundraising-goals.html", {
          data: this.viewData
        }, function() {});
      } else {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-fundraising-get-started.html", {}, function() {});
      }
    }
  });
});
