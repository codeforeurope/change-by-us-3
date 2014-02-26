define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/PostReplyModel", "model/UserModel"], function(_, Backbone, $, temp, moment, AbstractView, PostReplyModel, UserModel) {
  var PostReplyView;
  return PostReplyView = AbstractView.extend({
    tagName: "li",
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      this.model = new PostReplyModel(options_.model);
      return this.fetch();
    },
    onFetch: function() {
      var _this = this;
      this.viewData = this.model.attributes;
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
      var $reply,
        _this = this;
      this.viewData.image_url_round_small = this.user.get("image_url_round_small");
      this.viewData.display_name = this.user.get("display_name");
      this.viewData.format_date = moment(this.model.get("created_at")).format("MMMM D hh:mm a");
      console.log('@viewData.display_name', this.viewData.display_name);
      $reply = $("<div class='post-reply clearfix'/>");
      $reply.template(this.templateDir + "partials-universal/post-reply-view.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.el).append($reply);
    }
  });
});
