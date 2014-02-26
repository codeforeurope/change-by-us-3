define(["underscore", "backbone", "jquery", "template", "dropkick", "abstract-view", "autocomp", "model/ProjectModel", "collection/CityCollection", "resource-project-view"], function(_, Backbone, $, temp, dropkick, AbstractView, autocomp, ProjectModel, CityCollection, ResourceProjectPreviewView) {
  var BannerSearchView;
  return BannerSearchView = AbstractView.extend({
    byProjectResources: "all",
    sortByPopularDistance: "popular",
    locationObj: {
      lat: 0,
      lon: 0,
      name: ""
    },
    category: "",
    projects: null,
    ajax: null,
    cities: null,
    sortedCities: null,
    hasInitUserSend: false,
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      this.showResources = window.location.hash.substring(1) === "resources";
      return this.fetch();
    },
    fetch: function() {
      this.cities = new CityCollection();
      this.cities.on('reset', this.onFetch, this);
      return this.cities.fetch({
        reset: true
      });
    },
    events: {
      "click .search-catagories li": "onCategoriesClick",
      "click #modify": "onToggleVisibility",
      "click .pill-selection": "onPillSelection",
      "click .search-inputs .btn": "sendForm",
      "click .geo-pin": "onGeoClick",
      "click #all": "onToggleClick",
      "click #projects": "onToggleClick",
      "click #resources": "onToggleClick",
      "click .filter-within .close-x": "toggleModify",
      "focus #search-input": "onInputFocus",
      "focus #search-near": "onNearFocus",
      "keydown #search-input": "onInputEnter",
      "keydown #search-near": "onInputEnter"
    },
    render: function() {
      var _this = this;
      this.viewData.cities = this.sortedCities;
      this.$el = $(".banner-search");
      this.$el.template(this.templateDir + "partials-discover/banner-search.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var _this = this;
      this.$searchInput = $('#search-input');
      this.$searchNear = $('#search-near');
      this.$searchNear.typeahead({
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
      if (this.showResources) {
        $('#sort-by-pr .pill-selection').last().trigger('click');
      }
      this.$searchRange = $('#search-range').dropkick();
      this.$resultsModify = $('.results-modify');
      this.$filterWithin = $('.filter-within');
      this.$modifyInput = this.$resultsModify.find('input');
      this.$projectList = $("#projects-list");
      this.$searchCatagories = $('.search-catagories');
      this.$geoPin = $('.geo-pin');
      this.$all = $('#all');
      this.$projects = $('#projects');
      this.$resources = $('#resources');
      this.$submitButton = $('.go a');
      this.addListeners();
      this.autoGetGeoLocation();
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    addListeners: function() {
      var _this = this;
      this.$addOwn = $('#add-own').dropkick({
        change: function(v, l) {
          return window.location.href = "/create/" + v;
        }
      });
      this.$city = $('#city').dropkick({
        change: function(v, l) {
          return window.location.href = "/city/" + v;
        }
      });
      return $('body').click(function(e) {
        if (e.target === _this.$searchInput.get(0)) {
          return _this.$searchCatagories.show();
        } else {
          return _this.$searchCatagories.hide();
        }
      });
    },
    toggleActive: function(dir_) {
      var $li, hasActive;
      $li = this.$searchCatagories.find('li');
      hasActive = this.$searchCatagories.find('li.active').length > 0;
      if (dir_ === "up") {
        if (hasActive) {
          return $li.each(function(i) {
            var newI;
            if ($(this).hasClass('active')) {
              $(this).removeClass('active');
              newI = i === 0 ? $li.length - 1 : i - 1;
              $($li[newI]).addClass('active');
              return false;
            }
          });
        } else {
          return this.$searchCatagories.find('li').last().addClass('active');
        }
      } else {
        if (hasActive) {
          return $li.each(function(i) {
            var newI;
            if ($(this).hasClass('active')) {
              $(this).removeClass('active');
              newI = i < $li.length - 1 ? i + 1 : 0;
              $($li[newI]).addClass('active');
              return false;
            }
          });
        } else {
          return this.$searchCatagories.find('li').first().addClass('active');
        }
      }
    },
    updatePage: function() {
      var e, i, s, _i;
      this.$projectList.html("");
      s = this.index * this.perPage;
      e = (this.index + 1) * this.perPage - 1;
      for (i = _i = s; s <= e ? _i <= e : _i >= e; i = s <= e ? ++_i : --_i) {
        if (i < this.projects.length) {
          this.addProject(this.projects[i]);
        }
      }
      return $("html, body").animate({
        scrollTop: 0
      }, "slow");
    },
    updateSubmit: function() {
      if (this.hasInitUserSend) {
        this.$submitButton.text("Update");
        return this.$submitButton.css("font-size", "22px");
      }
    },
    addProject: function(id_) {
      var projectModel, view;
      projectModel = new ProjectModel({
        id: id_
      });
      view = new ResourceProjectPreviewView({
        model: projectModel,
        parent: "#projects-list",
        isDiscovered: true
      });
      return view.fetch();
    },
    autoGetGeoLocation: function() {
      var _this = this;
      if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(function(loc_) {
          return _this.handleGetCurrentPosition(loc_);
        }, this.sendForm);
      }
    },
    toggleModify: function(e) {
      var showSorting;
      showSorting = e ? false : true;
      this.$resultsModify.toggle(!showSorting);
      return this.$filterWithin.toggle(showSorting);
    },
    sendForm: function(e) {
      var dataObj, modifyInputVal,
        _this = this;
      if (e) {
        e.preventDefault();
        this.hasInitUserSend = true;
      }
      this.$searchCatagories.hide();
      this.$projectList.html("");
      modifyInputVal = this.$searchNear.val();
      dataObj = {
        s: this.category === "" ? this.$searchInput.val() : "",
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
        var k, size, t, v, _ref;
        if (response_.success) {
          _this.$modifyInput.val(modifyInputVal);
          _this.index = 0;
          _this.projects = [];
          size = 0;
          _ref = response_.data;
          for (k in _ref) {
            v = _ref[k];
            _this.projects.push(v._id);
            size++;
          }
          _this.updatePage();
          _this.setPages(size, $(".projects"));
          t = _this.byProjectResources === 'project' ? "Projects" : _this.byProjectResources === 'resource' ? "Resources" : "Resources & Projects";
          $('.projects h4').html(size + " " + t);
          onPageElementsLoad();
          return _this.trigger("ON_RESULTS", size);
        }
      });
    },
    onFetch: function(res_) {
      this.sortedCities = this.cities.sortBy(function(model) {
        return model.get('name');
      });
      return this.render();
    },
    onInputFocus: function() {
      this.updateSubmit();
      return this.category = "";
    },
    onNearFocus: function() {
      this.updateSubmit();
      return this.$geoPin.removeClass("active");
    },
    onGeoClick: function() {
      if (navigator.geolocation) {
        return this.autoGetGeoLocation();
      }
    },
    handleGetCurrentPosition: function(loc_) {
      var url,
        _this = this;
      this.locationObj.lat = loc_.coords.latitude;
      this.locationObj.lon = loc_.coords.longitude;
      url = "/api/project/geoname?lat=" + this.locationObj.lat + "&lon=" + this.locationObj.lon;
      if (this.autoLocation) {
        this.autoLocation.abort();
      }
      return this.autoLocation = $.get(url, function(resp) {
        if (resp.success && resp.data.length > 0) {
          _this.$geoPin.addClass("active");
          _this.$searchNear.val(resp.data[0].name);
          return _this.sendForm();
        }
      });
    },
    onCategoriesClick: function(e) {
      this.category = $(e.currentTarget).html();
      this.$searchInput.val(this.category);
      return this.$searchCatagories.hide();
    },
    onPillSelection: function(e) {
      var $this;
      $this = $(e.currentTarget);
      $this.toggleClass('active');
      $this.siblings().toggleClass('active');
      switch ($this.text()) {
        case 'Popular':
          this.sortByPopularDistance = 'popular';
          break;
        case 'Distance':
          this.sortByPopularDistance = 'distance';
          break;
      }
    },
    onToggleVisibility: function(e) {
      e.preventDefault();
      return this.toggleModify();
    },
    onToggleClick: function(e) {
      var $this;
      $('.type-toggle a').removeClass('active');
      $this = $(e.currentTarget);
      $this.addClass('active');
      switch ($this.text()) {
        case 'Projects':
          this.byProjectResources = 'project';
          break;
        case 'Resources':
          this.byProjectResources = 'resource';
          break;
        default:
          this.byProjectResources = 'all';
          break;
      }
    },
    onInputEnter: function(e) {
      switch (e.which) {
        case 13:
          if (this.locationObj.name !== this.$searchInput.val() || this.locationObj.name === "") {
            $(".tt-suggestion").first().trigger("click");
            if (this.$searchInput.val() === "" || this.$searchCatagories.is(':visible')) {
              if (this.$searchCatagories.find('li.active').length > 0) {
                this.category = this.$searchCatagories.find('li.active').html();
                this.$searchInput.val(this.category);
              }
            }
          }
          this.sendForm(e);
          break;
        case 38:
          this.toggleActive("up");
          break;
        case 40:
          this.toggleActive("down");
          break;
      }
    }
  });
});
