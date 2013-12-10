define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectDiscussionListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectDiscussionListItemView) {
  var ProjectDiscussionsView;
  return ProjectDiscussionsView = ProjectSubView.extend({
    parent: "#project-discussions",
    $ul: null,
    currentData: "",
    render: function() {
      this.$el = $(this.parent);
      this.templateLoaded = true;
      return console.log('ProjectDiscussionsView', this.collection, this);
    },
    addAll: function() {
      var _this = this;
      console.log('ProjectDiscussionsView addAll', this.collection);
      if (this.collection.models.length === 0) {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-zero-discussions.html", {}, function() {
          return onPageElementsLoad();
        });
      } else {
        this.collection.on('remove', function(obj_) {
          _this.addAll();
          return _this.deleteDiscussion(obj_.id);
        });
        return this.$el.template(this.templateDir + "/templates/partials-project/project-all-discussions.html", {}, function() {
          return _this.loadDayTemplate();
        });
      }
    },
    loadDayTemplate: function() {
      var _this = this;
      this.$day = $('<div />');
      return this.$day.template(this.templateDir + "/templates/partials-project/project-entries-day-wrapper.html", {}, function() {
        var m, model_;
        if (_this.collection.length > 0) {
          model_ = _this.collection.models[0];
          m = moment(model_.get("updated_at")).format("MMMM D");
          _this.newDay(m);
        }
        _this.isDataLoaded = true;
        return ProjectSubView.prototype.addAll.call(_this);
      });
    },
    newDay: function(date_) {
      this.currentDate = date_;
      this.$currentDay = this.$day.clone();
      this.$el.append(this.$currentDay);
      this.$currentDay.find('h4').html(date_);
      return this.$ul = this.$currentDay.find('.bordered-item');
    },
    addOne: function(model_) {
      var config, m, projectDiscussionListItemView,
        _this = this;
      m = moment(model_.get("updated_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      config = {
        model: model_
      };
      projectDiscussionListItemView = new ProjectDiscussionListItemView(config);
      projectDiscussionListItemView.on('click', function() {
        return _this.trigger('discussionClick', config);
      });
      this.$ul.append(projectDiscussionListItemView.$el);
      return onPageElementsLoad();
    },
    deleteDiscussion: function(id_) {
      var _this = this;
      return $.ajax({
        type: "POST",
        url: "/api/post/delete",
        data: {
          post_id: id_
        }
      }).done(function(response) {
        return console.log('deleteDiscussion', response);
      });
    }
  });
});
