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
    onCollectionLoad: function() {
      this.$el.find(".preload").remove();
      return this.addAll();
    },
    noResults: function() {
      return this.$el.find('.no-results').show();
    },
    addAll: function() {
      var _this = this;
      if (this.collection.length === 0) {
        this.noResults();
      }
      this.collection.each(function(model_) {
        return _this.addOne(model_);
      });
      return this.isDataLoaded = true;
    },
    addOne: function(model_) {},
    loadDayTemplate: function() {
      var _this = this;
      this.$day = $('<div class="day-wrapper"/>');
      return this.$day.template(this.templateDir + "partials-universal/entries-day-wrapper.html", {}, function() {
        return _this.onDayWrapperLoad();
      });
    },
    onDayWrapperLoad: function() {
      var m, model_;
      this.isDataLoaded = true;
      if (this.collection) {
        if (this.collection.length > 0) {
          model_ = this.collection.models[0];
          m = moment(model_.get("created_at")).format("MMMM D");
          return this.newDay(m);
        }
      }
    },
    newDay: function(date_) {
      console.log('newDay !!!!');
      this.currentDate = date_;
      this.$currentDay = this.$day.clone();
      this.$el.append(this.$currentDay);
      this.$currentDay.find('h4').html(date_);
      this.$ul = this.$currentDay.find('.bordered-item');
      return console.log('new Day ', this.$ul, this.$currentDay);
    }
  });
});
