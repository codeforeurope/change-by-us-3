define(["underscore", "backbone", "jquery", "template", "abstract-view", "collection/StreamCollection", "views/partials-project/ProjectUpdateListItemView"], function(_, Backbone, $, temp, AbstractView, StreamCollection, ProjectUpdateListItemView) {
  var CBUStreamView;
  return CBUStreamView = AbstractView.extend({
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      console.log('CBUStreamView initialize');
      this.collection = new StreamCollection();
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/stream.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      this.$container = this.$el.find('.body-container');
      this.collection.on("reset", this.onCollectionLoad, this);
      return this.collection.fetch({
        reset: true
      });
    },
    onCollectionLoad: function() {
      console.log('onCollectionLoad');
      this.$el.find(".preload").remove();
      return this.addAll();
    },
    addAll: function() {
      var _this = this;
      this.$day = $('<div />');
      return this.$day.template(this.templateDir + "/templates/partials-user/stream-day-wrapper.html", {}, function() {
        var m, model_;
        if (_this.collection.length > 0) {
          model_ = _this.collection.models[0];
          m = moment(model_.get("updated_at")).format("MMMM D");
          _this.newDay(m);
        }
        if (_this.collection.models.length === 0) {
          _this.noResults();
        }
        _this.collection.each(function(model) {
          return _this.addOne(model);
        });
        _this.isDataLoaded = true;
        return onPageElementsLoad();
      });
    },
    newDay: function(date_) {
      this.currentDate = date_;
      this.$currentDay = this.$day.clone();
      this.$currentDay.find('h4').html(date_);
      this.$container.append(this.$currentDay);
      return this.$projects = this.$currentDay.find('.projects-wrapper');
    },
    addOne: function(model_) {
      var m, view;
      console.log(model_, this.$ul);
      m = moment(model_.get("updated_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      view = new ProjectUpdateListItemView({
        model: model_,
        isStream: true
      });
      return this.$projects.append(view.$el);
    }
  });
});
