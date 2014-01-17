define(["underscore", "backbone", "jquery", "template", "abstract-view", "resource-project-view", "model/ProjectModel", "model/CityModel"], function(_, Backbone, $, temp, AbstractView, ResourceProjectPreviewView, ProjectModel, CityModel) {
  var CBUCityView;
  return CBUCityView = AbstractView.extend({
    $header: null,
    collection: null,
    initialize: function(options_) {
      var options,
        _this = this;
      options = options_;
      AbstractView.prototype.initialize.call(this, options);
      this.collection = options.collection || this.collection;
      return $.getJSON("/static/js/config/cities.json", function(data) {
        var id, obj;
        id = options.model.id;
        obj = data.cities[id];
        _this.model = new CityModel(obj);
        return _this.render();
      });
    },
    events: {
      "click .change-city a": "changeCity"
    },
    render: function() {
      var _this = this;
      this.viewData = this.model.attributes;
      this.$el = $("<div class='city-container'/>");
      this.$el.template(this.templateDir + "/templates/city.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    search: function(type_) {
      var dataObj,
        _this = this;
      console.log('@model', this.model);
      dataObj = {
        s: "",
        cat: "",
        loc: "",
        d: "25",
        type: type_,
        lat: this.model.get("lat"),
        lon: this.model.get("lon")
      };
      return $.ajax({
        type: "POST",
        url: "/api/project/search",
        data: JSON.stringify(dataObj),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).done(function(response_) {
        if (response_.success) {
          if (type_ === "project") {
            return _this.onProjectsLoad(response_.data);
          } else {
            return _this.onResourcesLoad(response_.data);
          }
        }
      });
    },
    addOne: function(id_, parent_) {
      var projectModel, view;
      projectModel = new ProjectModel({
        id: id_
      });
      view = new ResourceProjectPreviewView({
        model: projectModel,
        parent: parent_
      });
      return view.fetch();
    },
    /* EVENTS ---------------------------------------------*/

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
      this.$el.prepend(this.$header);
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    onHeaderLoaded: function() {
      var config, id;
      id = this.model.get("id");
      config = {
        id: id
      };
      this.search("project");
      this.search("resource");
      return this.delegateEvents();
    },
    onProjectsLoad: function(data_) {
      var $featuredProjects, $more, count, k, v;
      count = 0;
      for (k in data_) {
        v = data_[k];
        this.addOne(v._id, this.projectsView.find("ul"));
        count++;
      }
      $featuredProjects = $("#featured-projects");
      $more = $featuredProjects.find('.sub-link');
      if (count < 3) {
        $more.hide();
      }
      if (count === 0) {
        $featuredProjects.hide();
        return $('.city-container hr').hide();
      }
    },
    onResourcesLoad: function(data_) {
      var $featuredResources, $more, count, k, v;
      count = 0;
      for (k in data_) {
        v = data_[k];
        this.addOne(v._id, this.resourcesView.find("ul"));
        count++;
      }
      $featuredResources = $("#featured-resources");
      $more = $featuredResources.find('.sub-link');
      if (count < 3) {
        $more.hide();
      }
      if (count === 0) {
        $featuredResources.hide();
        return $('.city-container hr').hide();
      }
    }
  });
});
