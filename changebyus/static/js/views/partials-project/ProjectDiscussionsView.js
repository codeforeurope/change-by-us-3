define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectSubView", "views/partials-project/ProjectDiscussionListItemView"], function(_, Backbone, $, temp, AbstractView, ProjectSubView, ProjectDiscussionListItemView) {
  var ProjectDiscussionsView;
  return ProjectDiscussionsView = ProjectSubView.extend({
    parent: "#project-discussions",
    $ul: null,
    currentData: "",
    render: function() {
      this.$el = $(this.parent);
      return this.templateLoaded = true;
    },
    onCollectionLoad: function() {
      var _this = this;
      ProjectSubView.prototype.onCollectionLoad.call(this);
      this.collection.on('add', this.updateCount, this);
      return this.collection.on('remove', function(obj_) {
        _this.addAll();
        return _this.deleteDiscussion(obj_.id);
      });
    },
    addAll: function() {
      var _this = this;
      if (this.collection.models.length === 0) {
        return this.$el.template(this.templateDir + "partials-project/project-zero-discussions.html", {}, function() {
          return AbstractView.prototype.onTemplateLoad.call(_this);
        });
      } else {
        return this.$el.template(this.templateDir + "partials-project/project-all-discussions.html", {}, function() {
          return _this.loadDayTemplate();
        });
      }
    },
    loadDayTemplate: function() {
      var _this = this;
      this.$day = $('<div class="day-wrapper"/>');
      return this.$day.template(this.templateDir + "partials-universal/entries-day-wrapper.html", {}, function() {
        return _this.onDayWrapperLoad();
      });
    },
    onDayWrapperLoad: function() {
      var m, model_;
      this.isDataLoaded = true;
      if (this.collection.length > 0) {
        model_ = this.collection.models[0];
        m = moment(model_.get("created_at")).format("MMMM D");
        this.newDay(m);
      }
      this.updateCount();
      return ProjectSubView.prototype.addAll.call(this);
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
      m = moment(model_.get("created_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      config = {
        model: model_
      };
      projectDiscussionListItemView = new ProjectDiscussionListItemView(config);
      projectDiscussionListItemView.on('click', function() {
        return _this.trigger('DISCUSSION_CLICK', config);
      });
      this.$ul.append(projectDiscussionListItemView.$el);
      return onPageElementsLoad();
    },
    updateCount: function() {
      return this.$el.find(".admin-title").html("All Discussions (" + this.collection.models.length + ")");
    },
    show: function() {
      $(".day-wrapper").remove();
      ProjectSubView.prototype.show.call(this);
      return this.loadData();
    },
    deleteDiscussion: function(id_) {
      var $feedback,
        _this = this;
      $feedback = $("#discussions-feedback");
      return $.ajax({
        type: "POST",
        url: "/api/post/delete",
        data: {
          post_id: id_
        }
      }).done(function(res_) {
        if (res_.success) {
          return $feedback.hide();
        } else {
          return $feedback.show().html(res_.msg);
        }
      });
    }
  });
});
