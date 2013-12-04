define(["underscore", "backbone", "jquery", "template", "form", "abstract-modal-view"], function(_, Backbone, $, temp, form, AbstractModalView) {
  var ProjectEmbedCalendarModalView;
  return ProjectEmbedCalendarModalView = AbstractModalView.extend({
    initialize: function(options) {
      AbstractModalView.prototype.initialize.call(this, options);
      this.viewData.id = this.model.id;
      this.viewData.slug = this.model.slug;
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='modal-fullscreen'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-embed-calendar.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var options;
      AbstractModalView.prototype.onTemplateLoad.call(this, options);
      options = {
        success: function(response) {
          console.log(response);
          if (response.msg.toLowerCase() === "ok") {
            return window.location.reload();
          }
        }
      };
      return this.$el.find('form').ajaxForm(options);
    }
  });
});
