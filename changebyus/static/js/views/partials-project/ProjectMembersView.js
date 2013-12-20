var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectMemberListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectMemberListItemView) {
  var ProjectMembersView;
  return ProjectMembersView = ProjectSubView.extend({
    parent: "#project-members",
    team: [],
    members: [],
    $teamList: null,
    $memberList: null,
    projectID: 0,
    isOwnerOrganizer: false,
    view: "public",
    initialize: function(options) {
      this.isDataLoaded = options.isDataLoaded || this.isDataLoaded;
      this.view = options.view || this.view;
      this.projectID = options.projectID || this.projectID;
      this.model = options.model || this.model;
      this.isOwnerOrganizer = options.isOwnerOrganizer || this.isOwnerOrganizer;
      return ProjectSubView.prototype.initialize.call(this, options);
    },
    render: function() {
      var templateURL,
        _this = this;
      console.log('rr', this);
      this.$el = $(this.parent);
      this.viewData = this.model.attributes;
      this.viewData.isOwnerOrganizer = this.isOwnerOrganizer;
      templateURL = this.view === "public" ? "/templates/partials-project/project-members.html" : "/templates/partials-project/project-members-admin.html";
      return this.$el.template(this.templateDir + templateURL, {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      ProjectSubView.prototype.onTemplateLoad.call(this);
      this.$teamList = this.$el.find("#team-members ul");
      this.$memberList = this.$el.find("#project-members ul");
      if ((this.view === "public") && (this.collection.length > 0)) {
        this.onCollectionLoad();
      }
      return onPageElementsLoad();
    },
    onCollectionLoad: function() {
      var _this = this;
      ProjectSubView.prototype.onCollectionLoad.call(this);
      this.collection.on('change', function() {
        return _this.addAll();
      });
      return this.collection.on('remove', function() {
        return _this.addAll();
      });
    },
    addAll: function() {
      var model, _i, _j, _len, _len1, _ref, _ref1,
        _this = this;
      this.team = [];
      this.members = [];
      console.log('@collection addAll', this.collection);
      this.collection.each(function(model) {
        var roles;
        roles = model.get("roles");
        if (roles.length === 0) {
          return model.set("roles", ["Owner"]);
        } else {
          if ((__indexOf.call(roles, "MEMBER") >= 0) || (__indexOf.call(roles, "Member") >= 0)) {
            return _this.members.push(model);
          } else {
            return _this.team.push(model);
          }
        }
      });
      this.$teamList.html('');
      this.$memberList.html('');
      if (this.team.length === 0) {
        this.$teamList.parent().parent().hide();
      } else {
        this.$teamList.parent().parent().show();
        this.$teamList.parent().parent().find('h4').html(this.team.length + ' Person Team');
      }
      if (this.members.length === 0) {
        this.$memberList.parent().parent().hide();
      } else {
        this.$memberList.parent().parent().show();
        this.$memberList.parent().parent().find('h4').html(this.members.length + ' Members');
      }
      console.log('team >>>>>>>>>> ', this.team, this.members);
      if ((this.team.length === 0) && (this.members.length === 0)) {
        $('.no-results').show();
      } else {
        _ref = this.team;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          this.addTeam(model);
        }
        _ref1 = this.members;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          model = _ref1[_j];
          this.addMember(model);
        }
        ProjectSubView.prototype.addAll.call(this);
      }
      return this.isDataLoaded = true;
    },
    addTeam: function(model_) {
      var view;
      console.log('addTeam model_', model_);
      view = new ProjectMemberListItemView({
        model: model_,
        view: this.view,
        projectID: this.projectID
      });
      return this.$teamList.append(view.el);
    },
    addMember: function(model_) {
      var view;
      console.log('addMember model_', model_);
      view = new ProjectMemberListItemView({
        model: model_,
        view: this.view,
        projectID: this.projectID
      });
      return this.$memberList.append(view.el);
    }
  });
});
