define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectUpdateModel", "model/UserModel"], function(_, Backbone, $, temp, moment, AbstractView, ProjectUpdateModel, UserModel) {
  var UserStreamItemView;
  return UserStreamItemView = AbstractView.extend({
    model: ProjectUpdateModel,
    initialize: function(options) {
      var _this = this;
      AbstractView.prototype.initialize.call(this, options);
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
      var m,
        _this = this;
      this.viewData.image_url_round_small = this.user.get("image_url_round_small");
      this.viewData.display_name = this.user.get("display_name");
      m = moment(this.model.get("created_at")).format("MMMM D hh:mm a");
      this.model.set("format_date", m);
      $(this.el).template(this.templateDir + "/templates/partials-user/stream-item-view.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return this;
    }
  });
});
