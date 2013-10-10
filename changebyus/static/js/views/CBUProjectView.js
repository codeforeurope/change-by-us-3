define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectUpdatesView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "collection/ProjectUpdatesCollection"], function(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, ProjectUpdatesView, ProjectModel, ProjectCalendarCollection, ProjectMembersCollection, ProjectUpdatesCollection) {
  var CBUProjectView;
  return CBUProjectView = AbstractView.extend({
    projectCalenderView: null,
    projectMembersView: null,
    projectUpdatesView: null,
    updatesBTN: null,
    membersBTN: null,
    calendarBTN: null,
    initialize: function(options) {
      var _this = this;
      console.log('CBUProjectView options', options);
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.model = new ProjectModel(options.model);
      this.collection = options.collection || this.collection;
      return this.model.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='project-container'/>");
      this.$el.template(this.templateDir + "/templates/project.html", {}, function() {
        return _this.addSubViews();
      });
      return $(this.parent).append(this.$el);
    },
    addSubViews: function() {
      var $header,
        _this = this;
      $header = $("<div class='project-header'/>");
      $header.template(this.templateDir + "/templates/partials-project/project-header.html", {
        data: this.model.attributes
      }, function() {
        var hash, id, projectCalendarCollection, projectMembersCollection, projectUpdatesCollection;
        id = {
          id: _this.model.get("id")
        };
        projectUpdatesCollection = new ProjectUpdatesCollection(id);
        projectMembersCollection = new ProjectMembersCollection(id);
        projectCalendarCollection = new ProjectCalendarCollection(id);
        _this.projectUpdatesView = new ProjectUpdatesView({
          collection: projectUpdatesCollection
        });
        _this.projectMembersView = new ProjectMembersView({
          collection: projectMembersCollection
        });
        _this.projectCalenderView = new ProjectCalenderView({
          collection: projectCalendarCollection
        });
        _this.updatesBTN = $("a[href='#updates']");
        _this.membersBTN = $("a[href='#members']");
        _this.calendarBTN = $("a[href='#calendar']");
        hash = window.location.hash.substring(1);
        _this.toggleSubView((hash === "" ? "updates" : hash));
        $(window).bind("hashchange", function(e) {
          hash = window.location.hash.substring(1);
          return _this.toggleSubView(hash);
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
});
