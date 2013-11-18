define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], function(_, Backbone, $, temp, ProjectSubView) {
  var ProjectCalenderView;
  return ProjectCalenderView = ProjectSubView.extend({
    parent: "#project-calendar",
    render: function() {
      var _this = this;
      this.$el = $("<div class='project'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-calendar.html", {
        data: this.viewData
      }, function() {
        return _this.$el.find(".preload").remove();
      });
      return $(this.parent).append(this.$el);
    }
  });
});
