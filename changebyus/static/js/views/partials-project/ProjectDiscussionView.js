define(["underscore", "backbone", "jquery", "template", "model/ProjectDiscussionModel", "views/partials-project/ProjectSubView", "views/partials-project/ProjectWysiwygFormView", "views/partials-project/ProjectDiscussionThreadItemView"], function(_, Backbone, $, temp, ProjectDiscussionModel, ProjectSubView, ProjectWysiwygFormView, ProjectDiscussionThreadItemView) {
  var ProjectDiscussionView;
  return ProjectDiscussionView = ProjectSubView.extend({
    parent: "#project-discussion",
    $ul: null,
    $form: null,
    $threadFormID: '#add-thread-form',
    projectWysiwygFormView: null,
    delayedDataLoad: false,
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
      onPageElementsLoad();
      if (this.delayedDataLoad) {
        return this.onSuccess();
      }
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
    onSuccess: function() {
      var model, response, userAvatar, _i, _len, _ref;
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
      this.projectWysiwygFormView = new ProjectWysiwygFormView({
        parent: this.$threadFormID,
        id: this.model.get("id"),
        slim: true,
        userAvatar: userAvatar
      });
      return this.projectWysiwygFormView.success = function() {
        return window.location.reload();
      };
    },
    addDiscussion: function(model_) {
      var config, projectDiscussionThreadItemView;
      config = {
        parent: this.$ul,
        model: model_
      };
      projectDiscussionThreadItemView = new ProjectDiscussionThreadItemView(config);
      return this.$ul.append(projectDiscussionThreadItemView.$el);
    }
  });
});
