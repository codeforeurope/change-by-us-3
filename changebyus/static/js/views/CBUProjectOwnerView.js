define(["underscore", "backbone", "jquery", "template", "project-view", "collection/ProjectDiscussionsCollection", "collection/ProjectUpdatesCollection", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "views/partials-project/ProjectDiscussionsView", "views/partials-project/ProjectFundraisingView", "views/partials-project/ProjectAddUpdateView", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectInfoAppearanceView"], function(_, Backbone, $, temp, CBUProjectView, ProjectDiscussionsCollection, ProjectUpdatesCollection, ProjectCalendarCollection, ProjectMembersCollection, ProjectDiscussionsView, ProjectFundraisingView, ProjectAddUpdateView, ProjectCalenderView, ProjectMembersView, ProjectInfoAppearanceView) {
  var CBUProjectOwnerView;
  return CBUProjectOwnerView = CBUProjectView.extend({
    initialize: function(options) {
      return CBUProjectView.prototype.initialize.call(this, options);
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='project-container'/>");
      this.$el.template(this.templateDir + "/templates/project-owner.html", {}, function() {
        return _this.addSubViews();
      });
      return $(this.parent).append(this.$el);
    },
    addSubViews: function() {
      var $header,
        _this = this;
      $header = $("<div class='project-header'/>");
      $header.template(this.templateDir + "/templates/partials-project/project-owner-header.html", {
        data: this.model.attributes
      }, function() {
        var hash, id, projectCalendarCollection, projectDiscussionsCollection, projectMembersCollection;
        id = {
          id: _this.model.get("id")
        };
        projectDiscussionsCollection = new ProjectDiscussionsCollection(id);
        projectCalendarCollection = new ProjectCalendarCollection(id);
        projectMembersCollection = new ProjectMembersCollection(id);
        _this.projectDiscussionsView = new ProjectDiscussionsView({
          collection: projectDiscussionsCollection,
          parent: "#project-discussion"
        });
        _this.projectAddUpdateView = new ProjectAddUpdateView();
        _this.projectFundraisingView = new ProjectFundraisingView();
        _this.projectCalenderView = new ProjectCalenderView({
          collection: projectCalendarCollection
        });
        _this.projectMembersView = new ProjectMembersView({
          collection: projectMembersCollection
        });
        _this.projectInfoAppearanceView = new ProjectInfoAppearanceView();
        _this.discussionBTN = $("a[href='#discussion']");
        _this.updatesBTN = $("a[href='#updates']");
        _this.fundraisingBTN = $("a[href='#fundraising']");
        _this.calendarBTN = $("a[href='#calendar']");
        _this.membersBTN = $("a[href='#members']");
        _this.infoBTN = $("a[href='#info']");
        hash = window.location.hash.substring(1);
        _this.toggleSubView((hash === "" ? "discussion" : hash));
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
    toggleSubView: function(view_) {
      var btn, view, _i, _j, _len, _len1, _ref, _ref1;
      _ref = [this.projectDiscussionsView, this.projectAddUpdateView, this.projectFundraisingView, this.projectCalenderView, this.projectMembersView, this.projectInfoAppearanceView];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        view.hide();
      }
      _ref1 = [this.discussionBTN, this.updatesBTN, this.fundraisingBTN, this.calendarBTN, this.membersBTN, this.infoBTN];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        btn = _ref1[_j];
        btn.removeClass("active");
      }
      switch (view_) {
        case "discussion":
          this.projectDiscussionsView.show();
          return this.discussionBTN.addClass("active");
        case "updates":
          this.projectAddUpdateView.show();
          return this.updatesBTN.addClass("active");
        case "fundraising":
          this.projectFundraisingView.show();
          return this.fundraisingBTN.addClass("active");
        case "calendar":
          this.projectCalenderView.show();
          return this.calendarBTN.addClass("active");
        case "members":
          this.projectMembersView.show();
          return this.membersBTN.addClass("active");
        case "info":
          this.projectInfoAppearanceView.show();
          return this.infoBTN.addClass("active");
      }
    }
  });
});
