define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectCreateModalView;
  return ProjectCreateModalView = AbstractView.extend({
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='modal-fullscreen dark'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-create-modal.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      $(this.parent).append(this.$el);
      return {
        onTemplateLoad: function() {
          var _this = this;
          return this.$el.find(".close-x").click(function() {
            console.log('close');
            return _this.$el.remove();
          });
        }
      };
    }
  });
});
