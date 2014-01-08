define(["underscore", "backbone", "jquery", "template", "resource-project-view", "views/partials-project/ProjectMemberListItemView", "collection/FlaggedProjectCollection", "collection/FlaggedUserCollection", "abstract-view"], function(_, Backbone, $, temp, ResourceProjectPreviewView, ProjectMemberListItemView, FlaggedProjectCollection, FlaggedUserCollection, AbstractView) {
  var CBUAdminView;
  return CBUAdminView = AbstractView.extend({
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.flaggedProjects = options.collection || new FlaggedProjectCollection();
      this.flaggedUsers = options.collection || new FlaggedUserCollection();
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='body-container'/>");
      this.$el.template(this.templateDir + "/templates/admin.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var _this = this;
      this.$projects = $("#flagged-projects");
      this.$users = $("#flagged-users");
      this.$resources = $("#approved-resource");
      this.$projectsBTN = $("a[href='#projects']").parent();
      this.$usersBTN = $("a[href='#users']").parent();
      this.$resourcesBTN = $("a[href='#resources']").parent();
      this.flaggedProjects.on("reset", this.addProjects, this);
      this.flaggedProjects.fetch({
        reset: true
      });
      this.flaggedUsers.on("reset", this.addUsers, this);
      this.flaggedUsers.fetch({
        reset: true
      });
      $(window).bind("hashchange", function(e) {
        return _this.toggleSubView();
      });
      return this.toggleSubView();
    },
    addProjects: function() {
      var _this = this;
      return this.flaggedProjects.each(function(projectModel_) {
        return _this.addProject(projectModel_);
      });
    },
    addProject: function(projectModel_) {
      var view;
      view = new ResourceProjectPreviewView({
        model: projectModel_,
        isAdmin: true
      });
      view.render();
      return $("#projects-list").append(view.$el);
    },
    addUsers: function() {
      var _this = this;
      return this.flaggedUsers.each(function(userModel_) {
        return _this.addUser(userModel_);
      });
    },
    addUser: function(userModel_) {
      var view;
      console.log('userModel_', userModel_);
      view = new ProjectMemberListItemView({
        model: userModel_,
        isAdmin: true
      });
      view.render();
      return $("#users-list").append(view.$el);
    },
    toggleSubView: function() {
      var btn, v, _i, _j, _len, _len1, _ref, _ref1;
      this.currentView = window.location.hash.substring(1);
      _ref = [this.$projects, this.$users, this.$resources];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.hide();
      }
      _ref1 = [this.$projectsBTN, this.$usersBTN, this.$resourcesBTN];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        btn = _ref1[_j];
        btn.removeClass("active");
        console.log('btn', btn);
      }
      switch (this.currentView) {
        case "projects":
          this.$projects.show();
          return this.$projectsBTN.addClass("active");
        case "users":
          this.$users.show();
          return this.$usersBTN.addClass("active");
        default:
          this.$resources.show();
          return this.$resourcesBTN.addClass("active");
      }
    }
  });
});
