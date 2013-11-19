define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectEmbedCalendarModalView"], function(_, Backbone, $, temp, ProjectSubView, ProjectEmbedCalendarModalView) {
  var ProjectCalenderView;
  return ProjectCalenderView = ProjectSubView.extend({
    parent: "#project-calendar",
    projectEmbedCalendarModalView: null,
    render: function() {
      var _this = this;
      this.$el = $("<div class='project'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-calendar.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var _this = this;
      this.$el.find(".preload").remove();
      return $('.highlight').click(function(e) {
        e.preventDefault();
        return _this.projectEmbedCalendarModalView = new ProjectEmbedCalendarModalView({
          model: _this.model
        });
      });
    }
  });
});
