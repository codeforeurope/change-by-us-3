define(["underscore", "backbone", "jquery", "template", "project-view", "collection/ProjectDiscussionsCollection", "collection/ProjectUpdatesCollection", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "views/partials-project/ProjectDiscussionView", "views/partials-project/ProjectDiscussionsView", "views/partials-project/ProjectNewDiscussionView", "views/partials-project/ProjectFundraisingView", "views/partials-project/ProjectAddUpdateView", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectInfoAppearanceView"], function(_, Backbone, $, temp, CBUProjectView, ProjectDiscussionsCollection, ProjectUpdatesCollection, ProjectCalendarCollection, ProjectMembersCollection, ProjectDiscussionView, ProjectDiscussionsView, ProjectNewDiscussionView, ProjectFundraisingView, ProjectAddUpdateView, ProjectCalenderView, ProjectMembersView, ProjectInfoAppearanceView) {
  var CBUProjectOwnerView;
  return CBUProjectOwnerView = CBUProjectView.extend({
    initialize: function(options) {
      CBUProjectView.prototype.initialize.call(this, options);
      return console.log('CBUProjectOwnerView', this);
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
      console.log('addSubViews', this.model.attributes);
      $header = $("<div class='project-header'/>");
      $header.template(this.templateDir + "/templates/partials-project/project-owner-header.html", {
        data: this.model.attributes
      }, function() {
        var config, projectDiscussionsCollection, projectMembersCollection, projectUpdatesCollection, vData;
        config = {
          id: _this.model.get("id"),
          name: _this.model.get("name"),
          model: _this.model
        };
        console.log('CBUProjectOwnerView !!!!!!!!!!!!!!!!!!!!!!!!!', config);
        vData = {
          viewData: {
            isOwner: true
          }
        };
        projectDiscussionsCollection = new ProjectDiscussionsCollection(config);
        projectMembersCollection = new ProjectMembersCollection(config);
        projectUpdatesCollection = new ProjectUpdatesCollection(config);
        _this.projectDiscussionsView = new ProjectDiscussionsView({
          collection: projectDiscussionsCollection
        });
        _this.projectDiscussionView = new ProjectDiscussionView();
        _this.projectNewDiscussionView = new ProjectNewDiscussionView(config);
        _this.projectAddUpdateView = new ProjectAddUpdateView({
          collection: projectUpdatesCollection
        });
        _this.projectFundraisingView = new ProjectFundraisingView(config);
        _this.projectCalenderView = new ProjectCalenderView(vData);
        _this.projectMembersView = new ProjectMembersView({
          collection: projectMembersCollection
        });
        _this.projectInfoAppearanceView = new ProjectInfoAppearanceView(config);
        _this.projectDiscussionsView.on('discussionClick', function(arg_) {
          console.log('projectDiscussionsView arg_', arg_);
          _this.projectDiscussionView.updateDiscussion(arg_.model);
          return window.location.hash = "discussion/" + arg_.model.id;
        });
        /*
        						@projectDiscussionsView.on 'deleteDiscussion', (arg_)=>
        							console.log 'deleteDiscussion arg_',arg_
        */

        _this.discussionBTN = $("a[href='#discussions']");
        _this.updatesBTN = $("a[href='#updates']");
        _this.fundraisingBTN = $("a[href='#fundraising']");
        _this.calendarBTN = $("a[href='#calendar']");
        _this.membersBTN = $("a[href='#members']");
        _this.infoBTN = $("a[href='#info']");
        $(window).bind("hashchange", function(e) {
          return _this.toggleSubView();
        });
        _this.toggleSubView();
        return $("a[href^='#']").click(function(e) {
          return window.location.hash = $(this).attr("href").substring(1);
        });
      });
      return this.$el.prepend($header);
    },
    toggleSubView: function() {
      var btn, v, view, _i, _j, _len, _len1, _ref, _ref1;
      view = window.location.hash.substring(1);
      _ref = [this.projectDiscussionsView, this.projectDiscussionView, this.projectNewDiscussionView, this.projectAddUpdateView, this.projectFundraisingView, this.projectCalenderView, this.projectMembersView, this.projectInfoAppearanceView];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.hide();
      }
      _ref1 = [this.discussionBTN, this.updatesBTN, this.fundraisingBTN, this.calendarBTN, this.membersBTN, this.infoBTN];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        btn = _ref1[_j];
        btn.removeClass("active");
      }
      console.log('view', view.indexOf("discussion/") > -1);
      if (view.indexOf("discussion/") > -1) {
        this.projectDiscussionView.show();
        this.discussionBTN.addClass("active");
        return;
      }
      switch (view) {
        case "new-discussion":
          this.projectNewDiscussionView.show();
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
        default:
          this.projectDiscussionsView.show();
          return this.discussionBTN.addClass("active");
      }
    }
  });
});
