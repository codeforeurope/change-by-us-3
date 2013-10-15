define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectUpdateModel", "views/partials-project/ProjectPostReplyView"], function(_, Backbone, $, temp, moment, AbstractView, ProjectUpdateModel, ProjectPostReplyView) {
  var ProjectUpdateListItemView;
  return ProjectUpdateListItemView = AbstractView.extend({
    model: ProjectUpdateModel,
    $repliesHolder: null,
    $postRight: null,
    $replyForm: null,
    render: function() {
      var m,
        _this = this;
      m = moment(this.model.attributes.created_at).format("MMMM D hh:mm a");
      this.model.attributes.format_date = m;
      $(this.el).template(this.templateDir + "/templates/partials-project/project-update-list-item.html", {
        data: this.model.attributes
      }, function() {
        return _this.addReplies();
      });
      return this;
    },
    addReplies: function() {
      var $replyToggle, projectPostReplyView, reply, self, _i, _len, _ref,
        _this = this;
      self = this;
      this.$repliesHolder = $('<ul class="content-wrapper hide"/>');
      this.$postRight = this.$el.find('.update-content');
      $replyToggle = this.$el.find('.reply-toggle').first();
      $replyToggle.click(function() {
        $(this).find('.reply').toggleClass('hide');
        return self.$repliesHolder.toggleClass('hide');
      });
      _ref = this.model.get('responses');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        reply = _ref[_i];
        projectPostReplyView = new ProjectPostReplyView(reply);
        this.$repliesHolder.append(projectPostReplyView.$el);
      }
      this.$replyForm = $('<li class="post-reply-form"/>');
      return this.$replyForm.template(this.templateDir + "/templates/partials-project/project-post-reply-form.html", {
        data: this.model.attributes
      }, function() {
        return _this.onFormLoaded();
      });
    },
    onFormLoaded: function() {
      var options;
      this.$postRight.append(this.$repliesHolder);
      this.$repliesHolder.append(this.$replyForm);
      options = {
        success: function(response) {
          return console.log(response);
        }
      };
      return this.$replyForm.find('form').ajaxForm(options);
    }
  });
});
