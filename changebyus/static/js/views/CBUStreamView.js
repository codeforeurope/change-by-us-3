define(["underscore", "backbone", "jquery", "template", "abstract-view", "collection/StreamCollection", "views/partials-universal/UpdateListItemView"], function(_, Backbone, $, temp, AbstractView, StreamCollection, UpdateListItemView) {
  var CBUStreamView;
  return CBUStreamView = AbstractView.extend({
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
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
    addAll: function() {
      var _this = this;
      this.$day = $('<div />');
      return this.$day.template(this.templateDir + "/templates/partials-user/stream-day-wrapper.html", {}, function() {
        return _this.onStreamWrapperLoad();
      });
    },
    newDay: function(date_) {
      this.currentDate = date_;
      this.$currentDay = this.$day.clone();
      this.$currentDay.find('h4').html(date_);
      this.$container.append(this.$currentDay);
      return this.$projects = this.$currentDay.find('.stream-wrapper');
    },
    addOne: function(model_) {
      var m, view;
      m = moment(model_.get("created_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      view = new UpdateListItemView({
        model: model_,
        isStream: true,
        isMember: true
      });
      return this.$projects.append(view.$el);
    },
    /* EVENTS ---------------------------------------------*/

    onTemplateLoad: function() {
      this.$container = this.$el.find('.body-container');
      this.collection.on("reset", this.onCollectionLoad, this);
      this.collection.fetch({
        reset: true
      });
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    onCollectionLoad: function() {
      this.$el.find(".preload").remove();
      return this.addAll();
    },
    onStreamWrapperLoad: function() {
      var m, model_,
        _this = this;
      if (this.collection.length > 0) {
        model_ = this.collection.models[0];
        m = moment(model_.get("created_at")).format("MMMM D");
        this.newDay(m);
      }
      if (this.collection.models.length === 0) {
        this.noResults();
      }
      this.collection.each(function(model_) {
        return _this.addOne(model_);
      });
      this.isDataLoaded = true;
      return onPageElementsLoad();
    }
  });
});
