var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectMemberListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectMemberListItemView) {
  var ProjectMembersView;
  return ProjectMembersView = ProjectSubView.extend({
    parent: "#project-members",
    team: [],
    members: [],
    $teamList: null,
    $memberList: null,
    initialize: function(options) {
      this.isDataLoaded = options.isDataLoaded || this.isDataLoaded;
      ProjectSubView.prototype.initialize.call(this, options);
      return console.log("initialize @collection >> ", this.collection);
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-project/project-members.html", {}, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      ProjectSubView.prototype.onTemplateLoad.call(this);
      this.$teamList = this.$el.find("#team-members ul");
      this.$memberList = this.$el.find("#project-members ul");
      return onPageElementsLoad();
    },
    addAll: function() {
      var model, _i, _j, _len, _len1, _ref, _ref1,
        _this = this;
      console.log("@collection >> ", this.collection, this.collection.models.length);
      this.collection.each(function(model) {
        if (__indexOf.call(model.attributes.roles, "Project Owner") >= 0 || __indexOf.call(model.attributes.roles, "Organizer") >= 0) {
          _this.team.push(model);
        } else {
          _this.members.push(model);
        }
        return console.log('ProjectMembersView model.roles', model);
      });
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
      if (this.members.length > 0) {
        this.$memberList.parent().show();
      }
      return this.isDataLoaded = true;
    },
    addTeam: function(model_) {
      var view;
      console.log('addTeam model_', model_);
      view = new ProjectMemberListItemView({
        model: model_
      });
      return this.$teamList.append(view.el);
    },
    addMember: function(model_) {
      var view;
      console.log('addMember model_', model_);
      view = new ProjectMemberListItemView({
        model: model_
      });
      return this.$memberList.append(view.el);
    }
  });
});
