define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectDiscussionListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectDiscussionListItemView) {
  var ProjectDiscussionsView;
  return ProjectDiscussionsView = ProjectSubView.extend({
    parent: "#project-discussions",
    $ul: null,
    currentData: "",
    render: function() {
      this.$el = $(this.parent);
      return this.templateLoaded = true;
    },
    addAll: function() {
      var _this = this;
      console.log('ProjectDiscussionsView addAll', this.collection);
      if (this.collection.models.length === 0) {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-zero-discussions.html", {}, function() {
          return onPageElementsLoad();
        });
      } else {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-all-discussions.html", {}, function() {
          return _this.loadDayTemplate();
        });
      }
    },
    loadDayTemplate: function() {
      var _this = this;
      this.$day = $('<div />');
      return this.$day.template(this.templateDir + "/templates/partials-project/project-discussion-day.html", {}, function() {
        var m, model_;
        model_ = _this.collection.models[0];
        m = moment(model_.attributes.updated_at).format("MMMM D");
        _this.newDay(m);
        return ProjectSubView.prototype.addAll.call(_this);
      });
    },
    newDay: function(date_) {
      this.currentData = date_;
      this.$currentDay = this.$day.clone();
      this.$el.append(this.$currentDay);
      this.$currentDay.find('h4').html(date_);
      return this.$ul = this.$currentDay.find('.bordered-item');
    },
    addOne: function(model_) {
      var config, m, projectDiscussionListItemView,
        _this = this;
      m = moment(model_.attributes.updated_at).format("MMMM D");
      if (this.currentData !== m) {
        this.newDay(m);
      }
      config = {
        model: model_
      };
      projectDiscussionListItemView = new ProjectDiscussionListItemView(config);
      projectDiscussionListItemView.on('click', function() {
        return _this.trigger('discussionClick', config);
      });
      projectDiscussionListItemView.on('delete', function() {
        return _this.deleteDiscussion(config.model.attributes.id);
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
