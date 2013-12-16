define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/CityModel", "collection/CityProjectCollection", "collection/CityResourceCollection"], function(_, Backbone, $, temp, AbstractView, CityModel, CityProjectCollection, CityResourceCollection) {
  var CBUCityView;
  return CBUCityView = AbstractView.extend({
    $header: null,
    initialize: function(options) {
      var _this = this;
      this.model = new CityModel(options.model);
      this.collection = options.collection || this.collection;
      return this.model.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    events: {
      "click .change-city a": "changeCity"
    },
    render: function() {
      var _this = this;
      this.viewData = this.model.attributes;
      this.$el = $("<div class='city-container'/>");
      this.$el.template(this.templateDir + "/templates/city.html", this.viewData, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var _this = this;
      this.projectsView = this.$el.find('#featured-projects');
      this.resourcesView = this.$el.find('#featured-resources');
      this.$header = $("<div class='city-header'/>");
      this.$header.template(this.templateDir + "/templates/partials-city/city-header.html", {
        data: this.viewData
      }, function() {
        return _this.onHeaderLoaded();
      });
      return this.$el.prepend(this.$header);
    },
    onHeaderLoaded: function() {
      var config, id;
      id = this.model.get("id");
      config = {
        id: id
      };
      this.cityProjectCollection = new CityProjectCollection(config);
      this.cityProjectCollection.on("reset", this.onProjectsLoad, this);
      this.cityProjectCollection.fetch({
        reset: true
      });
      this.cityResourceCollection = new CityResourceCollection(config);
      this.cityResourceCollection.on("reset", this.onResourcesLoad, this);
      this.cityResourceCollection.fetch({
        reset: true
      });
      return this.delegateEvents();
    },
    onProjectsLoad: function() {
      var _this = this;
      return this.cityProjectCollection.each(function(projectModel) {
        return _this.addOne(projectModel, _this.projectsView.find("ul"), false, true);
      });
    },
    onResourcesLoad: function() {
      var _this = this;
      return this.cityResourceCollection.each(function(resourceModel) {
        return _this.addOne(resourceModel, _this.resourcesView.find("ul"), false, true);
      });
    },
    addOne: function(model_, parent_) {
      var view;
      view = new ResourceProjectPreviewView({
        model: model_
      });
      return this.$el.find(parent_).append(view.$el);
    }
  });
});
