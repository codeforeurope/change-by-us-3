define(["underscore", "backbone", "jquery", "template", "resource-project-view", "views/partials-project/ProjectMemberListItemView", "collection/FlaggedProjectCollection", "collection/FlaggedUserCollection", "collection/UnapprovedResourcesCollection", "abstract-view"], function(_, Backbone, $, temp, ResourceProjectPreviewView, ProjectMemberListItemView, FlaggedProjectCollection, FlaggedUserCollection, UnapprovedResourcesCollection, AbstractView) {
  var CBUAdminView;
  return CBUAdminView = AbstractView.extend({
    resourcesLoaded: 0,
    initialize: function(options_) {
      var options;
      options = options_;
      AbstractView.prototype.initialize.call(this, options);
      this.flaggedProjects = options.flaggedProjects || new FlaggedProjectCollection();
      this.flaggedUsers = options.flaggedUsers || new FlaggedUserCollection();
      this.unapprovedResources = options.unapprovedResources || new UnapprovedResourcesCollection();
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='body-container'/>");
      this.$el.template(this.templateDir + "admin.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      this.$projects = $("#flagged-projects");
      this.$users = $("#flagged-users");
      this.$resources = $("#approve-resources");
      this.$projectsBTN = $("#projects-btn");
      this.$usersBTN = $("#users-btn");
      this.$resourcesBTN = $("#resources-btn");
      return this.addListeners();
    },
    addListeners: function() {
      var _this = this;
      this.flaggedProjects.on("reset", this.addProjects, this);
      this.flaggedProjects.on("remove", (function() {
        return _this.updateView('project');
      }), this);
      this.flaggedProjects.fetch({
        reset: true
      });
      this.flaggedUsers.on("reset", this.addUsers, this);
      this.flaggedUsers.on("remove", (function() {
        return _this.updateView('user');
      }), this);
      this.flaggedUsers.fetch({
        reset: true
      });
      this.unapprovedResources.on("reset", this.addResources, this);
      this.unapprovedResources.on("remove", (function() {
        return _this.updateView('resource');
      }), this);
      this.unapprovedResources.fetch({
        reset: true
      });
      $(window).bind("hashchange", function(e) {
        return _this.toggleSubView();
      });
      this.toggleSubView();
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    buttonCheck: function() {
      this.resourcesLoaded++;
      if (this.flaggedProjects.length === 0) {
        this.$projectsBTN.hide();
      } else {
        this.$projectsBTN.show();
      }
      if (this.flaggedUsers.length === 0) {
        this.$usersBTN.hide();
      } else {
        this.$usersBTN.show();
      }
      if (this.unapprovedResources.length === 0) {
        this.$resourcesBTN.hide();
      } else {
        this.$resourcesBTN.show();
      }
      return this.checkHash();
    },
    addProjects: function() {
      var _this = this;
      this.buttonCheck();
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
      this.buttonCheck();
      return this.flaggedUsers.each(function(userModel_) {
        return _this.addUser(userModel_);
      });
    },
    addUser: function(userModel_) {
      var view;
      view = new ProjectMemberListItemView({
        model: userModel_,
        isAdmin: true
      });
      view.render();
      return $("#users-list").append(view.$el);
    },
    addResources: function() {
      var _this = this;
      this.buttonCheck();
      return this.unapprovedResources.each(function(resourceModel_) {
        return _this.addResource(resourceModel_);
      });
    },
    addResource: function(resourceModel_) {
      var view;
      view = new ResourceProjectPreviewView({
        model: resourceModel_,
        isAdmin: true
      });
      view.render();
      return $("#resource-list").append(view.$el);
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
      }
      switch (this.currentView) {
        case "users":
          this.$users.show();
          this.$usersBTN.addClass("active");
          break;
        case "resources":
          this.$resources.show();
          this.$resourcesBTN.addClass("active");
          break;
        default:
          this.$projects.show();
          this.$projectsBTN.addClass("active");
          break;
      }
      this.checkHash();
      this.buttonCheck();
      return onPageElementsLoad();
    },
    updateView: function(type_) {
      switch (type_) {
        case 'project':
          if (this.flaggedProjects.length === 0) {
            this.checkHash();
          }
          break;
        case 'resource':
          if (this.unapprovedResources.length === 0) {
            this.checkHash();
          }
          break;
        case 'user':
          if (this.flaggedUsers.length === 0) {
            this.checkHash();
          }
          break;
      }
    },
    checkHash: function() {
      if (this.resourcesLoaded >= 3) {
        if ((this.flaggedProjects.length === 0) && (this.flaggedUsers.length === 0) && (this.unapprovedResources.length === 0)) {

        } else {
          switch (this.currentView) {
            case "users":
              if (this.flaggedUsers.length === 0) {
                window.location.hash = this.flaggedProjects.length > 0 ? "projects" : "resources";
              }
              break;
            case "resources":
              if (this.unapprovedResources.length === 0) {
                window.location.hash = this.flaggedProjects.length > 0 ? "projects" : "users";
              }
              break;
            default:
              if (this.flaggedProjects.length === 0) {
                window.location.hash = this.flaggedUsers.length > 0 ? "users" : "resources";
              }
              break;
          }
        }
      }
    }
  });
});
