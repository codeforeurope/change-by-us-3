define(["underscore", "backbone", "jquery", "template", "project-view", "abstract-view", "model/ProjectModel", "collection/ProjectDiscussionsCollection", "collection/UpdatesCollection", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "views/partials-project/ProjectDiscussionView", "views/partials-project/ProjectDiscussionsView", "views/partials-project/ProjectNewDiscussionView", "views/partials-project/ProjectFundraisingView", "views/partials-project/ProjectAddUpdateView", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectInfoAppearanceView"], function(_, Backbone, $, temp, CBUProjectView, AbstractView, ProjectModel, ProjectDiscussionsCollection, UpdatesCollection, ProjectCalendarCollection, ProjectMembersCollection, ProjectDiscussionView, ProjectDiscussionsView, ProjectNewDiscussionView, ProjectFundraisingView, ProjectAddUpdateView, ProjectCalenderView, ProjectMembersView, ProjectInfoAppearanceView) {
  var CBUProjectOwnerView;
  return CBUProjectOwnerView = CBUProjectView.extend({
    initialize: function(options_) {
      var options,
        _this = this;
      console.log('new CBUProjectOwnerView');
      options = options_;
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.model = new ProjectModel(options.model);
      this.collection = options.collection || this.collection;
      this.isOwner = options.isOwner || this.isOwner;
      this.isResource = options.isResource || this.isResource;
      return this.model.fetch({
        success: function() {
          return _this.getMemberStatus();
        }
      });
    },
    events: {
      "click a[href^='#']": "changeHash"
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='project-container'/>");
      this.$el.template(this.templateDir + "/templates/project-owner.html", {}, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var _this = this;
      this.$header = $("<div class='project-header'/>");
      this.$header.template(this.templateDir + "/templates/partials-project/project-owner-header.html", {
        data: this.model.attributes
      }, function() {
        return _this.addSubViews();
      });
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    addSubViews: function() {
      var config, projectDiscussionsCollection, projectMembersCollection, updatesCollection,
        _this = this;
      config = {
        id: this.model.get("id"),
        name: this.model.get("name"),
        model: this.model,
        isOwner: this.memberData.owner,
        isOrganizer: this.memberData.organizer,
        view: "admin"
      };
      projectDiscussionsCollection = new ProjectDiscussionsCollection(config);
      projectMembersCollection = new ProjectMembersCollection(config);
      updatesCollection = new UpdatesCollection(config);
      this.projectDiscussionsView = new ProjectDiscussionsView({
        collection: projectDiscussionsCollection
      });
      this.projectDiscussionView = new ProjectDiscussionView({
        discussionsCollection: projectDiscussionsCollection
      });
      this.projectNewDiscussionView = new ProjectNewDiscussionView(config);
      this.projectAddUpdateView = new ProjectAddUpdateView({
        collection: updatesCollection,
        model: this.model
      });
      this.projectFundraisingView = new ProjectFundraisingView(config);
      this.projectCalenderView = new ProjectCalenderView(config);
      this.projectMembersView = new ProjectMembersView({
        collection: projectMembersCollection,
        view: "admin",
        projectID: this.model.id
      });
      this.projectInfoAppearanceView = new ProjectInfoAppearanceView(config);
      projectDiscussionsCollection.on('add remove', function(m_, c_) {
        return _this.updateCount(c_.length);
      });
      projectDiscussionsCollection.on('reset', function(c_) {
        return _this.updateCount(c_.length);
      });
      this.projectDiscussionsView.loadData();
      this.discussionBTN = $("a[href='#discussions']");
      this.updatesBTN = $("a[href='#updates']");
      this.fundraisingBTN = $("a[href='#fundraising']");
      this.calendarBTN = $("a[href='#calendar']");
      this.membersBTN = $("a[href='#members']");
      this.infoBTN = $("a[href='#info']");
      this.projectDiscussionsView.on('DISCUSSION_CLICK', function(arg_) {
        return window.location.hash = "discussion/" + arg_.model.id;
      });
      this.projectNewDiscussionView.on("NEW_DISCUSSION", function(arg_) {
        projectDiscussionsCollection.add(arg_);
        return window.location.hash = "discussion/" + arg_.id;
      });
      $(window).bind("hashchange", function(e) {
        return _this.toggleSubView();
      });
      this.toggleSubView();
      this.delegateEvents();
      return this.$el.prepend(this.$header);
    },
    toggleSubView: function() {
      var btn, id, slug, stripeAccount, v, view, _i, _j, _len, _len1, _ref, _ref1;
      view = window.location.hash.substring(1);
      slug = this.model.get('slug');
      stripeAccount = this.model.get("stripe_account");
      if (stripeAccount && view === "fundraising") {
        window.location.hash = "";
        window.location.href = "/project/" + slug + "/fundraising";
        return;
      }
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
      if (view.indexOf("discussion/") > -1) {
        id = view.split('/')[1];
        this.projectDiscussionView.updateDiscussion(id);
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
    },
    updateCount: function(count_) {
      return this.projectDiscussionView.updateCount(count_);
    },
    /* GETTER & SETTERS -----------------------------------------------------------------*/

    getMemberStatus: function() {
      var id,
        _this = this;
      id = this.model.get("id");
      return $.get("/api/project/" + id + "/user/" + window.userID, function(res_) {
        if (res_.success) {
          _this.memberData = res_.data;
          if (_this.memberData.organizer || _this.memberData.owner) {
            return _this.render();
          } else {
            return window.location.href = "/project/" + _this.model.get("slug");
          }
        }
      });
    }
  });
});
