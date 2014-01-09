define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/UpdateModel", "model/UserModel", "views/partials-universal/PostReplyView"], function(_, Backbone, $, temp, moment, AbstractView, UpdateModel, UserModel, PostReplyView) {
  var UpdateListItemView;
  return UpdateListItemView = AbstractView.extend({
    model: UpdateModel,
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
    events: {
      "click .reply-toggle:first": "onReplyToggleClick"
    },
    render: function() {
      var m,
        _this = this;
      this.viewData.image_url_round_small = this.user.get("image_url_round_small");
      this.viewData.display_name = this.user.get("display_name");
      m = moment(this.model.get("created_at")).format("MMMM D hh:mm a");
      this.model.set("format_date", m);
      return this.$el.template(this.templateDir + "/templates/partials-universal/update-list-item.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      var $projectTitle, projectName;
      if (this.isStream) {
        projectName = this.model.get("project").name;
        $projectTitle = $("<div/>").addClass("project-name-corner");
        $projectTitle.html(projectName);
        this.$el.append($projectTitle);
      }
      this.addReplies();
      return this.delegateEvents();
    },
    addReplies: function() {
      var reply, self, viewData, _i, _len, _ref,
        _this = this;
      self = this;
      this.$repliesHolder = $('<ul class="content-wrapper bordered-item np hide"/>');
      _ref = this.model.get('responses');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        reply = _ref[_i];
        this.addReply(reply);
      }
      viewData = this.model.attributes;
      viewData.image_url_round_small = $('.profile-nav-header img').attr('src');
      this.$replyForm = $('<li class="post-reply-form"/>');
      return this.$replyForm.template(this.templateDir + "/templates/partials-universal/post-reply-form.html", {
        data: viewData
      }, function() {
        return _this.onFormLoaded();
      });
    },
    addReply: function(reply_) {
      var postReplyView, replyForm;
      postReplyView = new PostReplyView({
        model: reply_
      });
      replyForm = this.$el.find('.post-reply-form');
      if (replyForm.length > 0) {
        return postReplyView.$el.insertBefore(replyForm);
      } else {
        return this.$repliesHolder.append(postReplyView.$el);
      }
    },
    onReplyToggleClick: function(e) {
      $(e.currentTarget).find('.reply').toggleClass('hide');
      return this.$repliesHolder.toggleClass('hide');
    },
    onFormLoaded: function() {
      var $form, options,
        _this = this;
      this.$el.find('.update-content').append(this.$repliesHolder);
      this.$repliesHolder.append(this.$replyForm);
      $form = this.$replyForm.find('form');
      options = {
        type: $form.attr('method'),
        url: $form.attr('action'),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(response_) {
          $form.find('form').resetForm();
          return _this.addReply(response_.data);
        }
      };
      return $form.submit(function() {
        var json_str, obj;
        obj = $form.serializeJSON();
        json_str = JSON.stringify(obj);
        options.data = json_str;
        $.ajax(options);
        return false;
      });
    }
  });
});
