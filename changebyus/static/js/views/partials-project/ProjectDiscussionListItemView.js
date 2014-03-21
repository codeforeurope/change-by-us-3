define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel"], function(_, Backbone, $, temp, AbstractView, UserModel) {
  var ProjectDiscussionListItemView;
  return ProjectDiscussionListItemView = AbstractView.extend({
    tagName: "li",
    user: null,
    initialize: function(options_) {
      var _this = this;
      AbstractView.prototype.initialize.call(this, options_);
      this.user = new UserModel({
        id: this.model.get("user").id
      });
      return this.user.fetch({
        success: function() {
          return _this.onFetch();
        }
      });
    },
    events: {
      "click .description": "viewDescription",
      "click .user-avatar": "viewDescription",
      "click .delete-x": "delete"
    },
    render: function() {
      var _this = this;
      this.$el = $(this.el);
      return this.$el.template(this.templateDir + "partials-project/project-discussion-list-item.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    viewDescription: function() {
      return this.trigger("click", this.model);
    },
    "delete": function() {
      var confirmation;
      confirmation = confirm("Do you really want to delete this post?");
      if (confirmation) {
        return this.model.collection.remove(this.model);
      }
    },
    onFetch: function() {
      var m;
      m = moment(this.model.get("created_at")).format("MMMM D hh:mm a");
      this.model.set("format_date", m);
      this.viewData = this.model.attributes;
      this.viewData.image_url_round_small = this.user.get("image_url_round_small");
      this.viewData.display_name = this.user.get("display_name");
      return this.render();
    }
  });
});
