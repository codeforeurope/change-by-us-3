define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectDiscussionListItemView"], function(_, Backbone, $, temp, ProjectSubView, ProjectDiscussionListItemView) {
  var ProjectDiscussionsView;
  return ProjectDiscussionsView = ProjectSubView.extend({
    parent: "#project-discussions",
    $ul: null,
    render: function() {
      return this.$el = $(this.parent);
    },
    addAll: function() {
      var _this = this;
      console.log('ProjectDiscussionsView addAll', this.collection);
      if (this.collection.models.length === 0) {
        this.$el.template(this.templateDir + "/templates/partials-project/project-zero-discussions.html", {}, function() {});
      } else {
        this.$el.template(this.templateDir + "/templates/partials-project/project-all-discussions.html", {}, function() {
          var model, _i, _len, _ref, _results;
          _this.$ul = _this.$el.find('.bordered-item');
          _ref = _this.collection.models;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            model = _ref[_i];
            _results.push(_this.addOne(model));
          }
          return _results;
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
        console.log('config', config.model.attributes.id);
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
