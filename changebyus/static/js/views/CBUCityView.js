define(["underscore", "backbone", "jquery", "template", "abstract-view", "resource-project-view", "model/ProjectModel", "model/CityModel"], function(_, Backbone, $, temp, AbstractView, ResourceProjectPreviewView, ProjectModel, CityModel) {
  var CBUCityView;
  return CBUCityView = AbstractView.extend({
    bothLoaded: 0,
    view: "",
    name: "",
    projects: [],
    resources: [],
    initialize: function(options_) {
      var options;
      options = options_;
      AbstractView.prototype.initialize.call(this, options);
      return this.fetch();
    },
    events: _.extend({}, AbstractView.prototype.events, {
      "click .change-city a": "changeCity"
    }),
    fetch: function() {
      var _this = this;
      return $.getJSON("/api/project/cities", function(res_) {
        var city, _i, _len, _ref, _results;
        _ref = res_.data.cities;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          city = _ref[_i];
          if (_this.model.id === city.slug) {
            _this.model = new CityModel(city);
            _this.render();
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
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
      dataObj = {
        s: "",
        cat: "",
        loc: "",
        d: "25",
        type: type_,
        lon: this.model.get("geo_location").coordinates[0],
        lat: this.model.get("geo_location").coordinates[1]
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
    addHashListener: function() {
      var _this = this;
      $(window).bind("hashchange", function(e) {
        return _this.toggleSubView();
      });
      return this.toggleSubView();
    },
    toggleSubView: function() {
      this.view = window.location.hash.substring(1);
      this.index = 0;
      switch (this.view) {
        case "projects":
          this.showOnlyProjects();
          return this.updatePage();
        case "resources":
          this.showOnlyResources();
          return this.updatePage();
        default:
          return this.showBoth();
      }
    },
    showOnlyProjects: function() {
      this.$projectsView.find("ul.projects").html("");
      this.$projectsView.find("h2").html("Projects");
      this.$projectsView.show();
      this.$moreProjects.hide();
      this.$resourcesView.hide();
      this.$hr.hide();
      return this.setPages(this.projects.length, this.$projectsView.parent());
    },
    showOnlyResources: function() {
      this.$resourcesView.find("ul.resources").html("");
      this.$resourcesView.find("h2").html("Resources");
      this.$resourcesView.show();
      this.$moreResources.hide();
      this.$projectsView.hide();
      this.$hr.hide();
      return this.setPages(this.resources.length, this.$resourcesView.parent());
    },
    showBoth: function() {
      var count, v, _i, _j, _len, _len1, _ref, _ref1;
      this.$projectsView.find("ul.projects").html("");
      this.$resourcesView.find("ul.resources").html("");
      this.$projectsView.find("h2").html("Featured Projects");
      this.$resourcesView.find("h2").html("Featured Resources");
      if (this.$paginationContainer) {
        this.$paginationContainer.remove();
      }
      count = 0;
      _ref = this.projects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        if (count++ < 3) {
          this.addOne(v._id, this.$projectsView.find("ul.projects"));
        }
      }
      if (count < 3) {
        this.$moreProjects.hide();
      } else {
        this.$moreProjects.show();
      }
      if (count === 0) {
        this.$projectsView.hide();
      } else {
        this.$projectsView.show();
      }
      count = 0;
      _ref1 = this.resources;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        v = _ref1[_j];
        if (count++ < 3) {
          this.addOne(v._id, this.$resourcesView.find("ul.resources"));
        }
      }
      if (count < 3) {
        this.$moreResources.hide();
      } else {
        this.$moreResources.show();
      }
      if (count === 0) {
        this.$resourcesView.hide();
      } else {
        this.$resourcesView.show();
      }
      if (this.projects.length === 0 || this.resources.length === 0) {
        return $('.city-container hr').hide();
      }
    },
    updatePage: function() {
      var e, i, list, s, view, _i;
      if (this.view === "projects") {
        list = this.projects;
        view = this.$projectsView.find("ul.projects");
      } else {
        list = this.resources;
        view = this.$resourcesView.find("ul.resources");
      }
      view.html("");
      s = this.index * this.perPage;
      e = (this.index + 1) * this.perPage - 1;
      for (i = _i = s; s <= e ? _i <= e : _i >= e; i = s <= e ? ++_i : --_i) {
        if (i < list.length) {
          this.addOne(list[i]._id, view);
        }
      }
      return $("html, body").animate({
        scrollTop: 0
      }, "slow");
    },
    addOne: function(id_, parent_) {
      var projectModel, view;
      console.log('addOne', id_, parent_);
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
      var $header,
        _this = this;
      this.name = this.model.get('name').split(',')[0];
      this.$projectsView = this.$el.find('#featured-projects');
      this.$resourcesView = this.$el.find('#featured-resources');
      this.$moreProjects = this.$projectsView.find('.sub-link');
      this.$moreResources = this.$resourcesView.find('.sub-link');
      this.$hr = $('.city-container hr');
      this.$projectsView.find('.sub-link a').html("See More Projects in " + this.name);
      this.$resourcesView.find('.sub-link a').html("See More Resources in " + this.name);
      $header = $("<div class='city-header'/>");
      $header.template(this.templateDir + "/templates/partials-city/city-header.html", {
        data: this.viewData
      }, function() {
        return _this.onHeaderLoaded();
      });
      this.$el.prepend($header);
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
    onProjectsLoad: function(projects_) {
      var k, v;
      for (k in projects_) {
        v = projects_[k];
        this.projects.push(v);
      }
      if (++this.bothLoaded === 2) {
        return this.addHashListener();
      }
    },
    onResourcesLoad: function(resources_) {
      var k, v;
      for (k in resources_) {
        v = resources_[k];
        this.resources.push(v);
      }
      if (++this.bothLoaded === 2) {
        return this.addHashListener();
      }
    }
  });
});
