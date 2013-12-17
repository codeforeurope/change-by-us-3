define(["underscore", "backbone", "jquery", "template", "model/ProjectDiscussionModel", "views/partials-project/ProjectSubView", "views/partials-universal/WysiwygFormView", "views/partials-project/ProjectDiscussionThreadItemView"], function(_, Backbone, $, temp, ProjectDiscussionModel, ProjectSubView, WysiwygFormView, ProjectDiscussionThreadItemView) {
  var ProjectDiscussionView;
  return ProjectDiscussionView = ProjectSubView.extend({
    parent: "#project-discussion",
    $ul: null,
    $form: null,
    $threadFormID: "#add-thread-form",
    wysiwygFormView: null,
    delayedDataLoad: false,
    render: function() {
      var _this = this;
      console.log('pdv >>>>>>>> ', this);
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
        userAvatar: userAvatar
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
