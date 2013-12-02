define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectUpdateModel", "model/UserModel", "views/partials-project/ProjectPostReplyView"], function(_, Backbone, $, temp, moment, AbstractView, ProjectUpdateModel, UserModel, ProjectPostReplyView) {
  var ProjectUpdateListItemView;
  return ProjectUpdateListItemView = AbstractView.extend({
    model: ProjectUpdateModel,
    $repliesHolder: null,
    $postRight: null,
    $replyForm: null,
    tagName: "li",
    initialize: function(options) {
      var _this = this;
      AbstractView.prototype.initialize.call(this, options);
      this.viewData = this.model.attributes;
      this.user = new UserModel({
        id: this.model.attributes.user.id
      });
      return this.user.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    render: function() {
      var m,
        _this = this;
      this.viewData.image_url_round_small = this.user.attributes.image_url_round_small;
      this.viewData.display_name = this.user.attributes.display_name;
      m = moment(this.model.attributes.created_at).format("MMMM D hh:mm a");
      this.model.attributes.format_date = m;
      $(this.el).template(this.templateDir + "/templates/partials-project/project-update-list-item.html", {
        data: this.viewData
      }, function() {
        return _this.addReplies();
      });
      return this;
    },
    addReplies: function() {
      var $replyToggle, projectPostReplyView, reply, self, _i, _len, _ref,
        _this = this;
      self = this;
      this.$repliesHolder = $('<ul class="content-wrapper bordered-item np hide"/>');
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
