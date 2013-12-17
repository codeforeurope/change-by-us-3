define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/UpdateModel", "model/UserModel", "views/partials-universal/PostReplyView"], function(_, Backbone, $, temp, moment, AbstractView, UpdateModel, UserModel, PostReplyView) {
  var UserStreamItemView;
  return UserStreamItemView = AbstractView.extend({
    model: UpdateModel,
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
    }
  });
});
