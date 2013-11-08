define(["underscore", "backbone", "jquery", "template", "abstract-view", "collection/ProjectListCollection"], function(_, Backbone, $, temp, AbstractView, ProjectListCollection) {
  var CBUProfileView;
  return CBUProfileView = AbstractView.extend({
    render: function() {
      var _this = this;
      console.log('@', this.model);
      return this.$el.template(this.templateDir + "/templates/profile.html", {}, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      return console.log('onTemplateLoad');
    }
  });
});
