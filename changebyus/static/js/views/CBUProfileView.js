define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var CBUProfileView;
  return CBUProfileView = AbstractView.extend({
    initialize: function(options) {
      /*
      				@model.fetch 
      					success: =>@render()
      */

    },
    render: function() {
      var _this = this;
      return this.$el.template(this.templateDir + "/templates/profile.html", {}, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {}
  });
});
