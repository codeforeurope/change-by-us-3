define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var CBUStreamView;
  return CBUStreamView = AbstractView.extend({
    initialize: function(options) {
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.viewData = options.viewData || this.viewData;
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.el);
      this.$el.template(this.templateDir + "/templates/stream.html", {
        data: this.viewData
      }, function() {});
      return $(this.parent).append(this.$el);
    }
  });
});
