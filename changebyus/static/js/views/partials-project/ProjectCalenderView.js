define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], function(_, Backbone, $, temp, ProjectSubView) {
  var ProjectCalenderView;
  ProjectCalenderView = ProjectSubView.extend({
    parent: "#project-calendar",
    render: function() {
      var self;
      self = this;
      this.$el = $("<div class='project'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-calendar.html", {
        data: this.viewData
      }, function() {
        return self.$el.find(".preload").remove();
      });
      return $(this.parent).append(this.$el);
    },
    addOne: function(model) {}
  });
  return ProjectCalenderView;
});
