define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/UserModel", "model/ProjectUpdateModel"], function(_, Backbone, $, temp, moment, AbstractView, UserModel, ProjectUpdateModel) {
  var ProjectDiscussionThreadItemView;
  return ProjectDiscussionThreadItemView = AbstractView.extend({
    model: ProjectUpdateModel,
    $repliesHolder: null,
    $postRight: null,
    $replyForm: null,
    tagName: "li",
    initialize: function(options_) {
      var _this = this;
      AbstractView.prototype.initialize.call(this, options_);
      return this.model.fetch({
        success: function() {
          return _this.loadUser();
        }
      });
    },
    loadUser: function() {
      var _this = this;
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
      m = moment(this.model.get('created_at')).format("MMMM D hh:mm a");
      this.model.set('created_at', m);
      this.viewData = this.model.attributes;
      this.viewData.image_url_round_small = this.user.get("image_url_round_small");
      this.viewData.display_name = this.user.get("display_name");
      return $(this.el).template(this.templateDir + "/templates/partials-project/project-thread-list-item.html", {
        data: this.viewData
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
      $replyToggle.click(function() {
        var top;
        top = $("#add-thread-form").offset().top;
        return $("html, body").animate({
          scrollTop: top
        }, "slow");
      });
      return onPageElementsLoad();
    }
  });
});
