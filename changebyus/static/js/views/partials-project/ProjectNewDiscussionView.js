define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-universal/WysiwygFormView"], function(_, Backbone, $, temp, AbstractView, WysiwygFormView) {
  var ProjectNewDiscussionView;
  return ProjectNewDiscussionView = AbstractView.extend({
    parent: "#project-new-discussion",
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      return this.render();
    },
    events: {
      "click input[value=Cancel]": "cancel"
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "partials-project/project-new-discussion.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      var form,
        _this = this;
      form = new WysiwygFormView({
        parent: "#discussion-form"
      });
      form.success = function(response_) {
        form.resetForm();
        return _this.trigger("NEW_DISCUSSION", response_.data);
      };
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    cancel: function() {
      $("#discussion-editor").html('');
      this.$el.find('form').resetForm();
      return window.location.hash = 'discussions';
    }
  });
});
