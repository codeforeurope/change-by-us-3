define(["underscore", "backbone", "bootstrap-fileupload", "button", "jquery", "template", "abstract-view", "collection/ProjectListCollection", "model/UserModel", "resource-project-view", "views/partials-user/ProfileEditView"], function(_, Backbone, fileupload, button, $, temp, AbstractView, ProjectListCollection, UserModel, ResourceProjectPreviewView, ProfileEditView) {
  var CBUDashboardView;
  return CBUDashboardView = AbstractView.extend({
    location: {
      name: "",
      lat: 0,
      lon: 0
    },
    className: "body-container",
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
      this.manageView = $('#manage-projects');
      this.followView = $('#follow-projects');
      this.profileView = $('#edit-profile');
      this.manageBTN = $("a[href='#manage']").parent();
      this.followBTN = $("a[href='#follow']").parent();
      this.profileBTN = $("a[href='#profile']").parent();
      $(window).bind("hashchange", function(e) {
        return _this.toggleSubView();
      });
      this.toggleSubView();
      $("a[href^='#']").click(function(e) {
        return window.location.hash = $(this).attr("href").substring(1);
      });
      return profileEditView = new ProfileEditView({
        model: this.userModel,
        parent: this.profileView
      });
    },
    toggleSubView: function() {
      var btn, v, view, _i, _j, _len, _len1, _ref, _ref1;
      view = window.location.hash.substring(1);
      _ref = [this.manageView, this.profileView, this.followView];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.hide();
      }
      _ref1 = [this.followBTN, this.profileBTN, this.manageBTN];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        btn = _ref1[_j];
        btn.removeClass("active");
      }
      switch (view) {
        case "follow":
          this.followView.show();
          return this.followBTN.addClass("active");
        case "profile":
          this.profileView.show();
          return this.profileBTN.addClass("active");
        default:
          this.manageView.show();
          return this.manageBTN.addClass("active");
      }
    },
    loadProjects: function() {
      this.joinedProjects = new ProjectListCollection();
      this.joinedProjects.url = "/api/project/user/" + this.model.id + "/joined-projects";
      this.joinedProjects.on("reset", this.addJoined, this);
      this.joinedProjects.fetch({
        reset: true
      });
      this.ownedProjects = new ProjectListCollection();
      this.ownedProjects.url = "/api/project/user/" + this.model.id + "/owned-projects";
      this.ownedProjects.on("reset", this.addOwned, this);
      this.ownedProjects.fetch({
        reset: true
      });
      return console.log('@joinedProjects', this.joinedProjects, '@ownedProjects', this.ownedProjects);
    },
    addJoined: function() {
      var _this = this;
      $('a[href=#follow]').append(" (" + this.joinedProjects.length + ")");
      return this.joinedProjects.each(function(projectModel) {
        return _this.addOne(projectModel, _this.followView.find("ul"), false, true);
      });
    },
    addOwned: function() {
      var _this = this;
      $('a[href=#manage]').append(" (" + this.ownedProjects.length + ")");
      return this.ownedProjects.each(function(projectModel) {
        return _this.addOne(projectModel, _this.manageView.find("ul"), true, false);
      });
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
        isResource: false
      });
      this.$el.find(parent_).append(view.$el);
      return delay(100, function() {
        buttonize3D();
        return positionFooter();
      });
    }
  });
});
