define(["underscore", "backbone", "jquery", "template", "model/ProjectDiscussionModel", "views/partials-project/ProjectSubView", "views/partials-universal/WysiwygFormView", "views/partials-project/ProjectDiscussionThreadItemView"], function(_, Backbone, $, temp, ProjectDiscussionModel, ProjectSubView, WysiwygFormView, ProjectDiscussionThreadItemView) {
  var ProjectDiscussionView;
  return ProjectDiscussionView = ProjectSubView.extend({
    $ul: null,
    $form: null,
    discussionsCollection: null,
    $threadFormID: "#add-thread-form",
    parent: "#project-discussion",
    wysiwygFormView: null,
    delayedDataLoad: false,
    initialize: function(options_) {
      this.discussionsCollection = options_.discussionsCollection || this.discussionsCollection;
      this.discussionsCollection.on('add', this.updateCount, this);
      this.discussionsCollection.on('reset', this.updateCount, this);
      console.log('@discussionsCollection', this.discussionsCollection);
      return ProjectSubView.prototype.initialize.call(this, options_);
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-project/project-discussion.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      this.templateLoaded = true;
      this.$ul = this.$el.find('.bordered-item');
      this.$form = this.$el.find(this.$threadFormID);
      if (this.delayedDataLoad) {
        this.onSuccess();
      }
      return ProjectSubView.prototype.onTemplateLoad.call(this);
    },
    updateDiscussion: function(id_) {
      var _this = this;
      this.model = new ProjectDiscussionModel({
        id: id_
      });
      return this.model.fetch({
        success: function() {
          if (_this.templateLoaded === false) {
            return _this.delayedDataLoad = true;
          } else {
            return _this.onSuccess();
          }
        }
      });
    },
    updateCount: function() {
      var title;
      console.log('ProjectDiscussionView updateCount', this.discussionsCollection);
      title = this.model != null ? this.model.get("title") : "";
      return this.$el.find(".admin-title").html("All Discussions (" + this.discussionsCollection.length + "): " + title);
    },
    onSuccess: function() {
      var model, response, userAvatar, _i, _len, _ref,
        _this = this;
      this.$ul.html('');
      this.$form.html('');
      this.addDiscussion(this.model);
      _ref = this.model.get("responses");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        response = _ref[_i];
        model = new ProjectDiscussionModel({
          id: response.id
        });
        this.addDiscussion(model);
      }
      userAvatar = $('.profile-nav-header img').attr('src');
      this.wysiwygFormView = new WysiwygFormView({
        parent: this.$threadFormID,
        id: this.model.get("id"),
        slim: true,
        userAvatar: userAvatar,
        title: this.model.get("title")
      });
      return this.wysiwygFormView.success = function(e) {
        if (e.success) {
          $("#new-thread-editor").html("");
          model = new ProjectDiscussionModel(e.data);
          return _this.addDiscussion(model);
        }
      };
    },
    addDiscussion: function(model_) {
      var projectDiscussionThreadItemView;
      projectDiscussionThreadItemView = new ProjectDiscussionThreadItemView({
        model: model_
      });
      return this.$ul.append(projectDiscussionThreadItemView.$el);
    }
  });
});
