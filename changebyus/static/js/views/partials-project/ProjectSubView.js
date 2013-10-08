define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectSubView;
  return ProjectSubView = AbstractView.extend({
    isDataLoaded: false,
    initialize: function(options) {
      AbstractView.prototype.initialize.apply(this, options);
      return this.render();
    },
    show: function() {
      this.$el.show();
      if (!this.isDataLoaded) {
        this.collection.on("reset", this.addAll, this);
        return this.collection.fetch({
          reset: true
        });
      }
    },
    loadData: function() {},
    addOne: function(model) {},
    addAll: function() {
      var self;
      self = this;
      this.collection.each(function(model) {
        return self.addOne(model);
      });
      return this.isDataLoaded = true;
    }
  });
});
