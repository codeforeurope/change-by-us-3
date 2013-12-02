define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectUpdateModel", "model/UserModel", "views/partials-project/ProjectPostReplyView"], function(_, Backbone, $, temp, moment, AbstractView, ProjectUpdateModel, UserModel, ProjectPostReplyView) {
  var ProjectUpdateListItemView;
  return ProjectUpdateListItemView = AbstractView.extend({
    model: ProjectUpdateModel,
    isStream: false,
    $repliesHolder: null,
    $postRight: null,
    $replyForm: null,
    initialize: function(options) {
      var _this = this;
      AbstractView.prototype.initialize.call(this, options);
      this.viewData = this.model.attributes;
      this.isStream = options.isStream || this.isStream;
      this.el = this.isStream ? $('<div/>').addClass('content-wrapper') : $('<li/>');
      this.$el = $(this.el);
      this.user = new UserModel({
        id: this.model.get("user").id
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
      this.viewData.image_url_round_small = this.user.get("image_url_round_small");
      this.viewData.display_name = this.user.get("display_name");
      m = moment(this.model.get("created_at")).format("MMMM D hh:mm a");
      this.model.set("format_date", m);
      this.$el.template(this.templateDir + "/templates/partials-project/project-update-list-item.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return this;
    },
    onTemplateLoad: function() {
      var $projectTitle, projectName;
      if (this.isStream) {
        projectName = this.model.get("project").name;
        $projectTitle = $("<div/>").addClass("project-name-corner");
        $projectTitle.html(projectName);
        this.$el.append($projectTitle);
      }
      return this.addReplies();
    },
    addReplies: function() {
      var $replyToggle, m, projectPostReplyView, reply, self, _i, _len, _ref,
        _this = this;
      console.log('addReplies', this.model);
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
        console.log('reply', reply);
        m = moment(this.model.get("created_at")).format("MMMM D hh:mm a");
        reply.format_date = m;
        projectPostReplyView = new ProjectPostReplyView({
          viewData: reply
        });
        this.$repliesHolder.append(projectPostReplyView.$el);
      }
      this.viewData = this.model.attributes;
      this.viewData.image_url_round_small = $('.profile-nav-header img').attr('src');
      this.$replyForm = $('<li class="post-reply-form"/>');
      return this.$replyForm.template(this.templateDir + "/templates/partials-project/project-post-reply-form.html", {
        data: this.viewData
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
