define(["underscore", "backbone", "jquery", "template", "project-view", "abstract-view", "model/ProjectModel", "collection/ProjectDiscussionsCollection", "collection/UpdatesCollection", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "views/partials-project/ProjectDiscussionView", "views/partials-project/ProjectDiscussionsView", "views/partials-project/ProjectNewDiscussionView", "views/partials-project/ProjectFundraisingView", "views/partials-project/ProjectAddUpdateView", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectInfoAppearanceView"], function(_, Backbone, $, temp, CBUProjectView, AbstractView, ProjectModel, ProjectDiscussionsCollection, UpdatesCollection, ProjectCalendarCollection, ProjectMembersCollection, ProjectDiscussionView, ProjectDiscussionsView, ProjectNewDiscussionView, ProjectFundraisingView, ProjectAddUpdateView, ProjectCalenderView, ProjectMembersView, ProjectInfoAppearanceView) {
  var CBUProjectOwnerView;
  return CBUProjectOwnerView = CBUProjectView.extend({
    initialize: function(options_) {
      var options,
        _this = this;
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
      this.viewData = this.model.attributes;
      this.viewData.isResource = this.isResource;
      this.$el = $("<div class='project-container'/>");
      this.$el.template(this.templateDir + "project-owner.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var _this = this;
      this.$header = $("<div class='project-header'/>");
      this.$header.template(this.templateDir + "partials-project/project-owner-header.html", {
        data: this.viewData
      }, function() {
        return _this.addSubViews();
      });
      this.$el.prepend(this.$header);
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    addSubViews: function() {
      var config, id, projectDiscussionsCollection, projectMembersCollection, updatesCollection,
        _this = this;
      id = this.model.get("id");
      config = {
        id: id,
        name: this.model.get("name"),
        model: this.model,
        isOwner: this.memberData.owner,
        isOrganizer: this.memberData.organizer,
        view: "admin"
      };
      projectDiscussionsCollection = new ProjectDiscussionsCollection();
      projectMembersCollection = new ProjectMembersCollection();
      updatesCollection = new UpdatesCollection();
      projectDiscussionsCollection.id = id;
      projectMembersCollection.id = id;
      updatesCollection.id = id;
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
      this.projectCalenderView = new ProjectCalenderView(config);
      this.projectMembersView = new ProjectMembersView({
        collection: projectMembersCollection,
        view: "admin",
        projectID: this.model.id
      });
      this.projectInfoAppearanceView = new ProjectInfoAppearanceView(config);
      if (!this.isResource) {
        this.projectFundraisingView = new ProjectFundraisingView(config);
      }
      this.$discussionBTN = $("a[href='#discussions']").parent();
      this.$updatesBTN = $("a[href='#updates']").parent();
      this.$fundraisingBTN = $("a[href='#fundraising']").parent();
      this.$calendarBTN = $("a[href='#calendar']").parent();
      this.$membersBTN = $("a[href='#members']").parent();
      this.$infoBTN = $("a[href='#info']").parent();
      projectDiscussionsCollection.on('add remove', function(m_, c_) {
        return _this.updateCount(c_.length);
      });
      projectDiscussionsCollection.on('reset', function(c_) {
        return _this.updateCount(c_.length);
      });
      this.projectDiscussionsView.loadData();
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
      return this.delegateEvents();
    },
    toggleSubView: function() {
      var btn, id, slug, stripeAccount, v, view, views, _i, _j, _len, _len1, _ref;
      view = window.location.hash.substring(1);
      slug = this.model.get('slug');
      stripeAccount = this.model.get("stripe_account");
      if (stripeAccount && view === "fundraising") {
        window.location.hash = "";
        window.location.href = "/project/" + slug + "/fundraising";
        return;
      }
      views = [this.projectDiscussionsView, this.projectDiscussionView, this.projectNewDiscussionView, this.projectAddUpdateView, this.projectCalenderView, this.projectMembersView, this.projectInfoAppearanceView];
      if (!this.isResource) {
        views.push(this.projectFundraisingView);
      }
      for (_i = 0, _len = views.length; _i < _len; _i++) {
        v = views[_i];
        v.hide();
      }
      _ref = [this.$discussionBTN, this.$updatesBTN, this.$fundraisingBTN, this.$calendarBTN, this.$membersBTN, this.$infoBTN];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        btn = _ref[_j];
        console.log(btn);
        btn.removeClass("active");
      }
      if (view.indexOf("discussion/") > -1) {
        id = view.split('/')[1];
        this.projectDiscussionView.updateDiscussion(id);
        this.projectDiscussionView.show();
        this.$discussionBTN.addClass("active");
        return;
      }
      console.log('toggleSubView', view);
      switch (view) {
        case "new-discussion":
          this.projectNewDiscussionView.show();
          this.$discussionBTN.addClass("active");
          break;
        case "updates":
          this.projectAddUpdateView.show();
          this.$updatesBTN.addClass("active");
          break;
        case "fundraising":
          this.projectFundraisingView.show();
          this.$fundraisingBTN.addClass("active");
          break;
        case "calendar":
          this.projectCalenderView.show();
          this.$calendarBTN.addClass("active");
          break;
        case "members":
          this.projectMembersView.show();
          this.$membersBTN.addClass("active");
          break;
        case "info":
          this.projectInfoAppearanceView.show();
          this.$infoBTN.addClass("active");
          break;
        default:
          this.projectDiscussionsView.show();
          this.$discussionBTN.addClass("active");
          console.log('discussion >>>>>>>>', this.$discussionBTN);
      }
      return onPageElementsLoad();
    },
    updateCount: function(count_) {
      return this.projectDiscussionView.updateCount(count_);
    },
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
