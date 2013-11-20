define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectUpdateModel", "views/partials-project/ProjectPostReplyView"], function(_, Backbone, $, temp, moment, AbstractView, ProjectUpdateModel, ProjectPostReplyView) {
  var ProjectDiscussionThreadItemView;
  return ProjectDiscussionThreadItemView = AbstractView.extend({
    model: ProjectUpdateModel,
    $repliesHolder: null,
    $postRight: null,
    $replyForm: null,
    tagName: "li",
    initialize: function(options_, forceLoad_) {
      AbstractView.prototype.initialize.call(this, options_);
      if (forceLoad_) {
        return this.loadModel();
      } else {
        return this.render();
      }
    },
    loadModel: function() {
      var _this = this;
      return this.model.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    render: function() {
      var m,
        _this = this;
      m = moment(this.model.get('created_at')).format("MMMM D hh:mm a");
      this.model.set({
        'created_at': m
      });
      return $(this.el).template(this.templateDir + "/templates/partials-project/project-thread-list-item.html", {
        data: this.model.attributes
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      var $replyToggle, self;
      self = this;
      this.$repliesHolder = $('<ul class="content-wrapper bordered-item np hide"/>');
      this.$postRight = this.$el.find('.update-content');
      $replyToggle = this.$el.find('.reply-toggle').first();
      return $replyToggle.click(function() {
        var top;
        top = $("#add-thread-form").offset().top;
        return $("html, body").animate({
          scrollTop: top
        }, "slow");
      });
    }
  });
});
