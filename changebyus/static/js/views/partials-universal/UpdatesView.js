define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-universal/UpdateListItemView"], function(_, Backbone, $, temp, ProjectSubView, UpdateListItemView) {
  var UpdatesView;
  return UpdatesView = ProjectSubView.extend({
    parent: "#project-update",
    members: null,
    $ul: null,
    currentData: "",
    initialize: function(options) {
      ProjectSubView.prototype.initialize.call(this, options);
      this.members = options.members || this.members;
      return this.viewData.isMember = options.isMember;
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-project/project-updates.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      return ProjectSubView.prototype.onTemplateLoad.call(this);
    },
    addAll: function() {
      var length,
        _this = this;
      this.$members = this.$el.find(".team-members ul");
      length = 0;
      this.members.each(function(model) {
        if (length++ < 4) {
          return _this.addMemeber(model);
        }
      });
      if (length <= 4) {
        $('.team-members .pull-right').remove();
      }
      this.$day = $('<div />');
      return this.$day.template(this.templateDir + "/templates/partials-project/project-entries-day-wrapper.html", {}, function() {
        var m, model_;
        if (_this.collection.length > 0) {
          model_ = _this.collection.models[0];
          m = moment(model_.get("updated_at")).format("MMMM D");
          _this.newDay(m);
        }
        _this.isDataLoaded = true;
        ProjectSubView.prototype.addAll.call(_this);
        return onPageElementsLoad();
      });
    },
    addMemeber: function(model_) {
      var $member,
        _this = this;
      if (model_.get("roles").length === 0) {
        model_.set("roles", ["Owner"]);
      }
      $member = $('<li/>');
      $member.template(this.templateDir + "/templates/partials-project/project-member-avatar.html", {
        data: model_.attributes
      }, function() {});
      this.$members.append($member);
      return console.log('addMemeber >>> ', model_);
    },
    newDay: function(date_) {
      console.log('newDay', date_);
      this.currentDate = date_;
      this.$currentDay = this.$day.clone();
      this.$el.append(this.$currentDay);
      this.$currentDay.find('h4').html(date_);
      return this.$ul = this.$currentDay.find('.bordered-item');
    },
    addOne: function(model_) {
      var m, view;
      console.log(model_, this.$ul);
      m = moment(model_.get("updated_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      view = new UpdateListItemView({
        model: model_
      });
      return this.$ul.append(view.$el);
    }
  });
});
