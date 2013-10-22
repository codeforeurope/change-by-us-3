define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectDiscussionListItemView;
  return ProjectDiscussionListItemView = AbstractView.extend({
    tagName: "li",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var m,
        _this = this;
      m = moment(this.model.attributes.created_at).format("MMMM D hh:mm a");
      this.model.attributes.format_date = m;
      this.$el = $(this.el);
      this.$el.template(this.templateDir + "/templates/partials-project/project-discussion-list-item.html", {
        data: this.model.attributes
      }, function() {
        _this.$el.find('.user-avatar, .description').click(function() {
          return _this.trigger("click", _this.model);
        });
        _this.$el.find('.delete').click(function() {
          return _this.trigger("delete", _this.model);
        });
        return console.log(_this.$el.find('.delete'));
      });
      return this;
    }
  });
});
