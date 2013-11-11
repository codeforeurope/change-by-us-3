define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
  var CBUStreamView;
  return CBUStreamView = Backbone.View.extend({
    parent: "body",
    templateDir: "/static",
    viewData: {},
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
