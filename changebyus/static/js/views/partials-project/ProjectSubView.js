define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectSubView;
  return ProjectSubView = AbstractView.extend({
    isDataLoaded: false,
    initialize: function(options) {
      console.log('ProjectSubView options', options);
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    show: function() {
      console.log(this, 'ProjectSubView show', this.isDataLoaded);
      this.$el.show();
      if (!this.isDataLoaded) {
        if (this.collection) {
          this.collection.on("reset", this.addAll, this);
          return this.collection.fetch({
            reset: true
          });
        }
      }
    },
    loadData: function() {},
    noResults: function() {},
    addOne: function(model) {},
    addAll: function() {
      var _this = this;
      if (this.collection.models.length === 0) {
        this.noResults();
      } else {
        this.$el.find(".preload").remove();
      }
      console.log('ProjectSubView addAll @collection.', this.collection.models);
      this.collection.each(function(model) {
        console.log('ProjectSubView >>>>', _this);
        return _this.addOne(model);
      });
      return this.isDataLoaded = true;
    }
  });
});
