define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectUpdatesView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMemberCollection", "collection/ProjectUpdatesCollection"], function(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, ProjectUpdatesView, ProjectModel, ProjectCalendarCollection, ProjectMemberCollection, ProjectUpdatesCollection) {
  var CBUProjectView;
  CBUProjectView = AbstractView.extend({
    projectCalenderView: null,
    projectMembersView: null,
    projectUpdatesView: null,
    updatesBTN: null,
    membersBTN: null,
    calendarBTN: null,
    initialize: function(options) {
      var self;
      self = this;
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.model = new ProjectModel(options.model);
      this.collection = options.collection || this.collection;
      return this.model.fetch({
        success: function() {
          return self.render();
        }
      });
    },
    render: function() {
      var self;
      self = this;
      this.$el = $("<div class='project-container'/>");
      this.$el.template(this.templateDir + "/templates/project.html", {}, function() {
        return self.addSubViews();
      });
      return $(this.parent).append(this.$el);
    },
    addSubViews: function() {
      var $header, self;
      self = this;
      $header = $("<div class='project-header'/>");
      $header.template(this.templateDir + "/templates/partials-project/project-header.html", {
        data: this.model.attributes
      }, function() {
        var hash, id, projectCalendarCollection, projectMemberCollection, projectUpdatesCollection;
        id = {
          id: self.model.get("id")
        };
        projectUpdatesCollection = new ProjectUpdatesCollection(id);
        projectMemberCollection = new ProjectMemberCollection(id);
        projectCalendarCollection = new ProjectCalendarCollection(id);
        self.projectUpdatesView = new ProjectUpdatesView({
          collection: projectUpdatesCollection
        });
        self.projectMembersView = new ProjectMembersView({
          collection: projectMemberCollection
        });
        self.projectCalenderView = new ProjectCalenderView({
          collection: projectCalendarCollection
        });
        self.updatesBTN = $("a[href='#updates']");
        self.membersBTN = $("a[href='#members']");
        self.calendarBTN = $("a[href='#calendar']");
        self.projectMembersView.hide();
        self.projectCalenderView.hide();
        hash = window.location.hash.substring(1);
        self.toggleSubView((hash === "" ? "updates" : hash));
        $(window).bind("hashchange", function(e) {
          hash = window.location.hash.substring(1);
          return self.toggleSubView(hash);
        });
        return $("a[href^='#']").click(function(e) {
          return window.location.hash = $(this).attr("href").substring(1);
        });
      });
      return this.$el.prepend($header);
    },
    toggleSubView: function(view) {
      this.projectUpdatesView.hide();
      this.projectMembersView.hide();
      this.projectCalenderView.hide();
      this.updatesBTN.removeClass("active");
      this.membersBTN.removeClass("active");
      this.calendarBTN.removeClass("active");
      switch (view) {
        case "updates":
          this.projectUpdatesView.show();
          return this.updatesBTN.addClass("active");
        case "members":
          this.projectMembersView.show();
          return this.membersBTN.addClass("active");
        case "calendar":
          this.projectCalenderView.show();
          return this.calendarBTN.addClass("active");
      }
    }
  });
  return CBUProjectView;
});
