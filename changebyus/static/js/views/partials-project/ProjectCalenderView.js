define(["underscore", "backbone", "jquery", "template", "abstract-view", "project-sub-view", "views/partials-project/ProjectEmbedCalendarModalView"], function(_, Backbone, $, temp, AbstractView, ProjectSubView, ProjectEmbedCalendarModalView) {
  var ProjectCalenderView;
  return ProjectCalenderView = ProjectSubView.extend({
    isOwner: false,
    isOrganizer: false,
    parent: "#project-calendar",
    view: "public",
    initialize: function(options_) {
      var options;
      options = options_ || {};
      this.id = options.id || this.id;
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      if (this.model) {
        this.viewData = this.model.attributes || this.viewData;
        this.viewData.isOwner = options.isOwner || this.isOwner;
        this.viewData.isOrganizer = options.isOrganizer || this.isOrganizer;
        this.viewData.view = options.view || this.view;
      }
      return this.render();
    },
    events: {
      "click #embed-calendar": "onEmbedCalendar",
      "click #delete-calendar": "onDeleteCalendar",
      "click #google-does-it-work": "slideToggle"
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "partials-project/project-calendar.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      this.$el.find(".preload").remove();
      this.$how = $('.content-left .content-wrapper');
      this.$how.slideToggle(1);
      return ProjectSubView.prototype.onTemplateLoad.call(this);
    },
    onEmbedCalendar: function(e) {
      e.preventDefault();
      return this.projectEmbedCalendarModalView = new ProjectEmbedCalendarModalView({
        model: this.model
      });
    },
    onDeleteCalendar: function(e) {
      var url;
      e.preventDefault();
      url = "/api/project/" + this.model.id + "/delete_calendar";
      return $.get(url, function(response_) {
        if (response_.success) {
          return window.location.reload();
        }
      });
    },
    slideToggle: function(e) {
      return this.$how.slideToggle();
    }
  });
});
