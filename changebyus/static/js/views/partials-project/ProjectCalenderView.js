define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectSubView", "views/partials-project/ProjectEmbedCalendarModalView"], function(_, Backbone, $, temp, AbstractView, ProjectSubView, ProjectEmbedCalendarModalView) {
  var ProjectCalenderView;
  return ProjectCalenderView = ProjectSubView.extend({
    isOwner: false,
    parent: "#project-calendar",
    projectEmbedCalendarModalView: null,
    initialize: function(options_) {
      var options;
      options = options_ || {};
      this.id = options_.id || this.id;
      this.templateDir = options_.templateDir || this.templateDir;
      this.parent = options_.parent || this.parent;
      this.viewData = this.model.attributes;
      this.viewData.isOwner = options_.isOwner || this.isOwner;
      this.render();
      return console.log('@viewData >>>>> ', this.viewData);
    },
    render: function() {
      var _this = this;
      console.log('@viewData <<<<< ', this.viewData);
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
