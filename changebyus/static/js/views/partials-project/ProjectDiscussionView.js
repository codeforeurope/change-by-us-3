define(["underscore", "backbone", "jquery", "template", "model/ProjectDiscussionModel", "views/partials-project/ProjectSubView", "views/partials-project/ProjectWysiwygFormView", "views/partials-project/ProjectDiscussionThreadItemView"], function(_, Backbone, $, temp, ProjectDiscussionModel, ProjectSubView, ProjectWysiwygFormView, ProjectDiscussionThreadItemView) {
  var ProjectDiscussionView;
  return ProjectDiscussionView = ProjectSubView.extend({
    parent: "#project-discussion",
    $ul: null,
    $form: null,
    $threadFormID: '#add-thread-form',
    projectWysiwygFormView: null,
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
      this.$ul = this.$el.find('.bordered-item');
      this.$form = this.$el.find(this.$threadFormID);
      return onPageElementsLoad();
    },
    updateDiscussion: function(discussion_) {
      var model, response, _i, _len, _ref;
      this.$ul.html('');
      this.$form.html('');
      this.addOne(discussion_);
      _ref = discussion_.attributes.responses;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        response = _ref[_i];
        model = new ProjectDiscussionModel({
          id: response.id
        });
        this.addOne(model, true);
      }
      return this.projectWysiwygFormView = new ProjectWysiwygFormView({
        parent: this.$threadFormID,
        id: discussion_.attributes.id
      });
    },
    addOne: function(model_, forceLoad_) {
      var config, projectDiscussionThreadItemView;
      if (forceLoad_ == null) {
        forceLoad_ = false;
      }
      config = {
        parent: this.$ul,
        model: model_
      };
      projectDiscussionThreadItemView = new ProjectDiscussionThreadItemView(config, forceLoad_);
      return this.$ul.append(projectDiscussionThreadItemView.$el);
    }
  });
});
