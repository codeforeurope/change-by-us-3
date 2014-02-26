var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

define(["underscore", "backbone", "jquery", "template", "project-sub-view", "views/partials-universal/UpdateListItemView"], function(_, Backbone, $, temp, ProjectSubView, UpdateListItemView) {
  var UpdatesView;
  return UpdatesView = ProjectSubView.extend({
    members: null,
    $ul: null,
    currentData: "",
    isResource: false,
    isMember: false,
    isOwnerOrganizer: false,
    initialize: function(options_) {
      ProjectSubView.prototype.initialize.call(this, options_);
      this.members = options_.members || this.members;
      this.isMember = options_.isMember || this.isMember;
      return this.isOwnerOrganizer = options_.isOwnerOrganizer || this.isOwnerOrganizer;
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "partials-universal/updates.html", {
        data: this.model.attributes
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    addAll: function() {
      var i,
        _this = this;
      i = 0;
      this.$members = this.$el.find(".team-members ul");
      this.members.each(function(model) {
        if (i++ < 4) {
          return _this.addMember(model);
        }
      });
      if (i <= 4) {
        $('.team-members .pull-right').remove();
      }
      this.$day = $("<div class='entries-day-wrapper'/>");
      return this.$day.template(this.templateDir + "partials-universal/entries-day-wrapper.html", {}, function() {
        return _this.onDayWrapperLoad();
      });
    },
    onDayWrapperLoad: function() {
      ProjectSubView.prototype.onDayWrapperLoad.call(this);
      ProjectSubView.prototype.addAll.call(this);
      return onPageElementsLoad();
    },
    addOne: function(model_) {
      var m, view;
      m = moment(model_.get("created_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      console.log('isOwnerOrganizer ------ ', this.isOwnerOrganizer);
      view = new UpdateListItemView({
        model: model_,
        isMember: this.isMember,
        isOwnerOrganizer: this.isOwnerOrganizer
      });
      return this.$ul.append(view.$el);
    },
    addMember: function(model_) {
      var $member, roles;
      if (model_.get("active")) {
        roles = model_.get("roles");
        if (roles.length === 0) {
          model_.set("roles", ["Owner"]);
        }
        if ((__indexOf.call(roles, "MEMBER") >= 0) || (__indexOf.call(roles, "Member") >= 0)) {
          return;
        }
        $member = $('<li/>');
        $member.template(this.templateDir + "partials-universal/member-avatar.html", {
          data: model_.attributes
        });
        return this.$members.append($member);
      }
    }
  });
});
