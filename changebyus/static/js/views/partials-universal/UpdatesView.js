var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-universal/UpdateListItemView"], function(_, Backbone, $, temp, ProjectSubView, UpdateListItemView) {
  var UpdatesView;
  return UpdatesView = ProjectSubView.extend({
    members: null,
    $ul: null,
    currentData: "",
    isResource: false,
    isMember: false,
    initialize: function(options) {
      ProjectSubView.prototype.initialize.call(this, options);
      this.members = options.members || this.members;
      this.isMember = options.isMember;
      this.viewData.slug = this.model.get('slug');
      this.viewData.isResource = options.isResource;
      return this.viewData.isOwnerOrganizer = options.isOwnerOrganizer;
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-universal/updates.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    addAll: function() {
      var length,
        _this = this;
      this.$members = this.$el.find(".team-members ul");
      length = 0;
      this.members.each(function(model) {
        if (length++ < 4) {
          return _this.addMember(model);
        }
      });
      if (length <= 4) {
        $('.team-members .pull-right').remove();
      }
      this.$day = $('<div />');
      return this.$day.template(this.templateDir + "/templates/partials-universal/entries-day-wrapper.html", {}, function() {
        var m, model_;
        if (_this.collection.length > 0) {
          model_ = _this.collection.models[0];
          m = moment(model_.get("created_at")).format("MMMM D");
          _this.newDay(m);
        }
        _this.isDataLoaded = true;
        ProjectSubView.prototype.addAll.call(_this);
        return onPageElementsLoad();
      });
    },
    addOne: function(model_) {
      var m, view;
      m = moment(model_.get("created_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      view = new UpdateListItemView({
        model: model_,
        isMember: this.isMember
      });
      return this.$ul.append(view.$el);
    },
    addMember: function(model_) {
      var $member, roles,
        _this = this;
      roles = model_.get("roles");
      if (roles.length === 0) {
        model_.set("roles", ["Owner"]);
      }
      if ((__indexOf.call(roles, "MEMBER") >= 0) || (__indexOf.call(roles, "Member") >= 0)) {
        return;
      }
      $member = $('<li/>');
      $member.template(this.templateDir + "/templates/partials-universal/member-avatar.html", {
        data: model_.attributes
      }, function() {});
      return this.$members.append($member);
    },
    newDay: function(date_) {
      this.currentDate = date_;
      this.$currentDay = this.$day.clone();
      this.$el.append(this.$currentDay);
      this.$currentDay.find('h4').html(date_);
      return this.$ul = this.$currentDay.find('.bordered-item');
    }
  });
});
