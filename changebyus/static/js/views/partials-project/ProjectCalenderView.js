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
<<<<<<< HEAD
    },
    onTemplateLoad: function() {
      var _this = this;
      this.$el.find(".preload").remove();
      return $('#embed-calendar').click(function(e) {
        e.preventDefault();
        return _this.projectEmbedCalendarModalView = new ProjectEmbedCalendarModalView({
          model: _this.model
        });
      });
=======
>>>>>>> 5bfaf1db13a264c9c0fb7b8e30f4d187d708c531
    }
  });
});
