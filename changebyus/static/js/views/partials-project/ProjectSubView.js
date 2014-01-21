define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectSubView;
  return ProjectSubView = AbstractView.extend({
    isDataLoaded: false,
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      return this.render();
    },
    show: function() {
      this.$el.show();
      if (this.collection && this.isDataLoaded === false) {
        if (this.templateLoaded) {
          return this.loadData();
        } else {
          return this.delayedCollectionLoad = true;
        }
      }
    },
    loadData: function() {
      if (this.collection) {
        this.collection.on("reset", this.onCollectionLoad, this);
        return this.collection.fetch({
          reset: true
        });
      }
    },
    noResults: function() {
      return this.$el.find('.no-results').show();
    },
    onCollectionLoad: function() {
      console.log('ProjectSubView onCollectionLoad');
      this.$el.find(".preload").remove();
      return this.addAll();
    },
    addOne: function(model_) {},
    addAll: function() {
      var _this = this;
      if (this.collection.length === 0) {
        this.noResults();
      }
      this.collection.each(function(model_) {
        return _this.addOne(model_);
      });
      return this.isDataLoaded = true;
    }
  });
});
