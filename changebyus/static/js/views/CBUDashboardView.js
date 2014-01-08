define(["underscore", "backbone", "bootstrap-fileupload", "button", "jquery", "template", "abstract-view", "collection/ProjectListCollection", "model/UserModel", "resource-project-view", "views/partials-user/ProfileEditView"], function(_, Backbone, fileupload, button, $, temp, AbstractView, ProjectListCollection, UserModel, ResourceProjectPreviewView, ProfileEditView) {
  var CBUDashboardView;
  return CBUDashboardView = AbstractView.extend({
    location: {
      name: "",
      lat: 0,
      lon: 0
    },
    className: "body-container",
    currentView: "",
    initialize: function(options) {
      var _this = this;
      AbstractView.prototype.initialize.call(this, options);
      this.userModel = new UserModel({
        id: this.model.id
      });
      return this.userModel.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    events: {
      "click a[href^='#']": "changeHash"
    },
    render: function() {
      var _this = this;
      this.$el.template(this.templateDir + "/templates/dashboard.html", {
        data: this.userModel.attributes
      }, function() {
        _this.onTemplateLoad();
        return _this.loadProjects();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var profileEditView,
        _this = this;
      this.$manageView = $('#manage-projects');
      this.$followView = $('#follow-projects');
      this.$profileView = $('#edit-profile');
      this.$manageBTN = $("a[href='#manage']").parent();
      this.$followBTN = $("a[href='#follow']").parent();
      this.$profileBTN = $("a[href='#profile']").parent();
      $(window).bind("hashchange", function(e) {
        return _this.toggleSubView();
      });
      this.toggleSubView();
      return profileEditView = new ProfileEditView({
        model: this.userModel,
        parent: this.$profileView
      });
    },
    toggleSubView: function() {
      var btn, v, _i, _j, _len, _len1, _ref, _ref1;
      this.currentView = window.location.hash.substring(1);
      _ref = [this.$manageView, this.$profileView, this.$followView];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.hide();
      }
      _ref1 = [this.$followBTN, this.$profileBTN, this.$manageBTN];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        btn = _ref1[_j];
        btn.removeClass("active");
      }
      switch (this.currentView) {
        case "follow":
          this.$followView.show();
          return this.$followBTN.addClass("active");
        case "profile":
          this.$profileView.show();
          return this.$profileBTN.addClass("active");
        default:
          this.$manageView.show();
          return this.$manageBTN.addClass("active");
      }
    },
    loadProjects: function() {
      this.joinedProjects = new ProjectListCollection();
      this.joinedProjects.url = "/api/project/user/" + this.model.id + "/joined-projects";
      this.joinedProjects.on("reset", this.addJoined, this);
      this.joinedProjects.on("remove", this.updateCount, this);
      this.joinedProjects.on("change", this.updateCount, this);
      this.joinedProjects.fetch({
        reset: true
      });
      this.ownedProjects = new ProjectListCollection();
      this.ownedProjects.url = "/api/project/user/" + this.model.id + "/owned-projects";
      this.ownedProjects.on("reset", this.addOwned, this);
      this.ownedProjects.on("remove", this.updateCount, this);
      this.ownedProjects.on("change", this.updateCount, this);
      return this.ownedProjects.fetch({
        reset: true
      });
    },
    updateCount: function() {
      $('a[href=#follow]').html("Follow (" + this.joinedProjects.length + ")");
      return $('a[href=#manage]').html("Manage (" + this.ownedProjects.length + ")");
    },
    addJoined: function() {
      this.updateCount();
      this.updateProjects(this.joinedProjects.models, this.$followView.find(".projects"), false, true);
      return this.setPages(this.joinedProjects.length, this.$followView);
    },
    addOwned: function() {
      this.updateCount();
      this.updateProjects(this.ownedProjects.models, this.$manageView.find(".projects"), true, false);
      return this.setPages(this.ownedProjects.length, this.$manageView);
    },
    updatePage: function() {
      var $ul;
      if (this.currentView === "follow") {
        $ul = this.$followView.find(".projects");
        $ul.html("");
        this.updateProjects(this.joinedProjects.models, $ul, false, true);
      } else {
        $ul = this.$manageView.find(".projects");
        $ul.html("");
        this.updateProjects(this.ownedProjects.models, $ul, true, false);
      }
      return $("html, body").animate({
        scrollTop: 0
      }, "slow");
    },
    updateProjects: function(results_, parent_, isOwned_, isFollowed_) {
      var e, i, projectModel, s, _i, _results;
      if (isOwned_ == null) {
        isOwned_ = false;
      }
      if (isFollowed_ == null) {
        isFollowed_ = false;
      }
      s = this.index * this.perPage;
      e = (this.index + 1) * this.perPage - 1;
      _results = [];
      for (i = _i = s; s <= e ? _i <= e : _i >= e; i = s <= e ? ++_i : --_i) {
        if (i < results_.length) {
          projectModel = results_[i];
          _results.push(this.addOne(projectModel, parent_, isOwned_, isFollowed_));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    addOne: function(projectModel_, parent_, isOwned_, isFollowed_) {
      var view;
      if (isOwned_ == null) {
        isOwned_ = false;
      }
      if (isFollowed_ == null) {
        isFollowed_ = false;
      }
      view = new ResourceProjectPreviewView({
        model: projectModel_,
        isOwned: isOwned_,
        isFollowed: isFollowed_,
        isProject: true,
        isResource: false,
        parent: parent_
      });
      return view.fetch();
    }
  });
});
