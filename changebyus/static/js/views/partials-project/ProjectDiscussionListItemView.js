define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel"], function(_, Backbone, $, temp, AbstractView, UserModel) {
  var ProjectDiscussionListItemView;
  return ProjectDiscussionListItemView = AbstractView.extend({
    tagName: "li",
    user: null,
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
      m = moment(this.model.get("created_at")).format("MMMM D hh:mm a");
      this.model.set("format_date", m);
      this.viewData.image_url_round_small = this.user.get("image_url_round_small");
      this.viewData.display_name = this.user.get("display_name");
      this.$el = $(this.el);
      return this.$el.template(this.templateDir + "/templates/partials-project/project-discussion-list-item.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      var _this = this;
      this.$el.find('.user-avatar, .description').click(function() {
        return _this.trigger("click", _this.model);
      });
      return this.$el.find('.delete').click(function() {
        return _this.trigger("delete", _this.model);
      });
    }
  });
});
