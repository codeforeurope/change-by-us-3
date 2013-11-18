define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectUpdateListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectUpdateListItemView) {
  var ProjectUpdatesView;
  return ProjectUpdatesView = ProjectSubView.extend({
    parent: "#project-update",
    members: null,
    initialize: function(options) {
      ProjectSubView.prototype.initialize.call(this, options);
      this.members = options.members || this.members;
      this.viewData.isMember = options.isMember;
      return console.log('@viewData>>>>', this.viewData);
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      this.$el.template(this.templateDir + "/templates/partials-project/project-updates.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return console.log('@viewData   >>>>', this.viewData);
    },
    onTemplateLoad: function() {
      var _this = this;
      ProjectSubView.prototype.onTemplateLoad.call(this);
      this.$ul = this.$el.find(".updates-container ul");
      this.$members = this.$el.find(".team-members ul");
      this.members.each(function(model) {
        return _this.addMemeber(model);
      });
      return onPageElementsLoad();
    },
    addMemeber: function(model_) {
      var $member,
        _this = this;
      console.log('addMemeber', model_);
      $member = $('<li/>');
      $member.template(this.templateDir + "/templates/partials-project/project-member-avatar.html", {
        data: model_.attributes
      }, function() {});
      return this.$members.append($member);
    },
    addOne: function(model_) {
      var view;
      view = new ProjectUpdateListItemView({
        model: model_
      });
      return this.$ul.append(view.render().$el);
    }
  });
});
