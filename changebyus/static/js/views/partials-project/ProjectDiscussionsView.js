define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectDiscussionListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectDiscussionListItemView) {
  var ProjectDiscussionsView;
  return ProjectDiscussionsView = ProjectSubView.extend({
    parent: "#project-discussions",
    $ul: null,
    render: function() {
      this.$el = $(this.parent);
      return this.templateLoaded = true;
    },
    addAll: function() {
      var _this = this;
      console.log('ProjectDiscussionsView addAll', this.collection);
      if (this.collection.models.length === 0) {
        this.$el.template(this.templateDir + "/templates/partials-project/project-zero-discussions.html", {}, function() {
          return onPageElementsLoad();
        });
      } else {
        this.$el.template(this.templateDir + "/templates/partials-project/project-all-discussions.html", {}, function() {
          _this.$ul = _this.$el.find('.bordered-item');
          ProjectSubView.prototype.addAll.call(_this);
          return onPageElementsLoad();
        });
      }
      return this.isDataLoaded = true;
    },
    addOne: function(model_) {
      var config, projectDiscussionListItemView,
        _this = this;
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
      return this.$ul.append(projectDiscussionListItemView.$el);
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
