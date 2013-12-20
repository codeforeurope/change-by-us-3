define(["underscore", "backbone", "jquery", "template", "dropkick", "abstract-view", "autocomp", "model/ProjectModel", "resource-project-view"], function(_, Backbone, $, temp, dropkick, AbstractView, autocomp, ProjectModel, ResourceProjectPreviewView) {
  var BannerSearchView;
  return BannerSearchView = AbstractView.extend({
    byProjectResources: 'projects',
    sortByPopularDistance: 'popular',
    locationObj: {
      lat: 0,
      lon: 0,
      name: ""
    },
    category: "",
    ajax: null,
    initSend: true,
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    events: {
      "click .search-catagories li": "categoriesClick",
      "focus #search-input": "showInput",
      "keypress #search-input": "onInputEnter",
      "click #modify": "toggleVisibility",
      "click .pill-selection": "pillSelection",
      "click .search-inputs .btn": "sendForm"
    },
    render: function() {
      var _this = this;
      this.$el = $(".banner-search");
      this.$el.template(this.templateDir + "/templates/partials-discover/banner-search.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var $dropkick,
        _this = this;
      $('#search-near').typeahead({
        template: '<div class="zip">{{ name }} {{ zip }}</div>',
        engine: Hogan,
        valueKey: 'name',
        name: 'zip',
        remote: {
          url: "/api/project/geopoint?s=%QUERY",
          filter: function(resp) {
            var loc, zips, _i, _len, _ref;
            zips = [];
            if (resp.msg.toLowerCase() === "ok" && resp.data.length > 0) {
              _ref = resp.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                loc = _ref[_i];
                zips.push({
                  'name': loc.name,
                  'lat': loc.lat,
                  'lon': loc.lon,
                  'zip': loc.zip
                });
              }
            }
            return zips;
          }
        }
      }).bind('typeahead:selected', function(obj, datum) {
        return _this.locationObj = datum;
      });
      $dropkick = $('#search-range').dropkick();
      this.$resultsModify = $('.results-modify');
      this.delegateEvents();
      onPageElementsLoad();
      return this.autoGetGeoLocation();
    },
    autoGetGeoLocation: function() {
      var _this = this;
      if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(function(loc) {
          return _this.handleGetCurrentPosition(loc);
        }, this.sendForm);
      } else {
        return this.sendForm();
      }
    },
    handleGetCurrentPosition: function(loc) {
      var url;
      this.locationObj.lat = loc.coords.latitude;
      this.locationObj.lon = loc.coords.longitude;
      console.log('handleGetCurrentPosition:(loc)', loc);
      url = "/api/project/geoname?lat=" + this.locationObj.lat + "&lon=" + this.locationObj.lon;
      $.get(url, function(resp) {
        if (resp.success) {
          return $("#search-near").val(resp.data[0].name);
        }
      });
      return this.sendForm();
    },
    categoriesClick: function(e) {
      this.category = $(e.currentTarget).html();
      $('#search-input').val(this.category);
      return $('.search-catagories').hide();
    },
    pillSelection: function(e) {
      var $this;
      $this = $(e.currentTarget);
      $this.toggleClass('active');
      $this.siblings().toggleClass('active');
      switch ($this.html()) {
        case 'Projects':
          return this.byProjectResources = 'projects';
        case 'Resources':
          return this.byProjectResources = 'resources';
        case 'Popular':
          return this.sortByPopularDistance = 'popular';
        case 'Distance':
          return this.sortByPopularDistance = 'distance';
      }
    },
    showInput: function() {
      this.category = "";
      return $('.search-catagories').show();
    },
    toggleVisibility: function(e) {
      var onClick;
      onClick = false;
      if (e) {
        e.preventDefault();
        onClick = true;
      }
      this.$resultsModify.toggle(!onClick);
      $('.search-toggles').toggle(onClick);
      return $('.filter-within').toggle(onClick);
    },
    onInputEnter: function(e) {
      if (e.which === 13) {
        return this.sendForm();
      }
    },
    sendForm: function(e) {
      var dataObj,
        _this = this;
      if (e) {
        e.preventDefault();
      }
      $('.search-catagories').hide();
      $("#projects-list").html("");
      dataObj = {
        s: this.category === "" ? $("#search-input").val() : "",
        cat: this.category,
        loc: this.locationObj.name,
        d: $("select[name='range']").val(),
        type: this.byProjectResources,
        lat: this.locationObj.lat,
        lon: this.locationObj.lon
      };
      if (this.ajax) {
        this.ajax.abort();
      }
      return this.ajax = $.ajax({
        type: "POST",
        url: "/api/project/search",
        data: JSON.stringify(dataObj),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).done(function(response_) {
        var k, size, v, _ref;
        if (response_.success) {
          if (_this.initSend === false) {
            if (_this.locationObj.name !== "") {
              _this.toggleVisibility();
            }
            _this.$resultsModify.find('input').val(_this.locationObj.name);
          }
          _this.initSend = false;
          size = 0;
          _ref = response_.data;
          for (k in _ref) {
            v = _ref[k];
            _this.addProject(v._id);
            size++;
          }
          $('h4').html(size + " Projects");
          return onPageElementsLoad();
        }
      });
    },
    addProject: function(id_) {
      var projectModel, view;
      projectModel = new ProjectModel({
        id: id_
      });
      view = new ResourceProjectPreviewView({
        model: projectModel,
        parent: "#projects-list"
      });
      return view.fetch();
    }
  });
});
