define(["underscore", "backbone", "jquery", "template", "dropkick", "abstract-view", "autocomp", "model/ProjectModel", "resource-project-view"], function(_, Backbone, $, temp, dropkick, AbstractView, autocomp, ProjectModel, ResourceProjectPreviewView) {
  var BannerSearchView;
  return BannerSearchView = AbstractView.extend({
    byProjectResources: 'project',
    sortByPopularDistance: 'popular',
    locationObj: {
      lat: 0,
      lon: 0,
      name: ""
    },
    category: "",
    projects: null,
    ajax: null,
    initSend: true,
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.showResources = window.location.hash.substring(1) === "resources";
      return this.render();
    },
    events: {
      "click .search-catagories li": "categoriesClick",
      "click #modify": "toggleVisibility",
      "click .pill-selection": "pillSelection",
      "click .search-inputs .btn": "sendForm",
      "focus #search-input": "showInput",
      "keypress #search-input": "onInputEnter",
      "keypress #search-near": "onInputEnter"
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
      $dropkick = $('#search-range').dropkick();
      this.$resultsModify = $('.results-modify');
      this.$projectList = $("#projects-list");
      this.autoGetGeoLocation();
      return AbstractView.prototype.onTemplateLoad.call(this);
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
      var url,
        _this = this;
      this.locationObj.lat = loc.coords.latitude;
      this.locationObj.lon = loc.coords.longitude;
      url = "/api/project/geoname?lat=" + this.locationObj.lat + "&lon=" + this.locationObj.lon;
      $.get(url, function(resp) {
        if (resp.success && resp.data.length > 0) {
          return _this.$searchNear.val(resp.data[0].name);
        }
      });
      return this.sendForm();
    },
    categoriesClick: function(e) {
      this.category = $(e.currentTarget).html();
      this.$searchInput.val(this.category);
      return $('.search-catagories').hide();
    },
    pillSelection: function(e) {
      var $this;
      $this = $(e.currentTarget);
      $this.toggleClass('active');
      $this.siblings().toggleClass('active');
      switch ($this.html()) {
        case 'Projects':
          this.byProjectResources = 'project';
          $('#create-project').css('display', 'block');
          return $('#create-resource').hide();
        case 'Resources':
          this.byProjectResources = 'resource';
          $('#create-project').hide();
          return $('#create-resource').css('display', 'block');
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
        console.log($(".tt-suggestion").first());
        console.log(this, this.locationObj.name, this.$searchInput.val());
        if (this.locationObj.name !== this.$searchInput.val() || this.locationObj.name === "") {
          $(".tt-suggestion").first().trigger("click");
        }
        return this.sendForm();
      }
    },
    sendForm: function(e) {
      var dataObj,
        _this = this;
      if (e) {
        e.preventDefault();
      }
      $(".search-catagories").hide();
      this.$projectList.html("");
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
          if (_this.initSend === false) {
            if (_this.locationObj.name !== "") {
              _this.toggleVisibility();
            }
            _this.$resultsModify.find('input').val(_this.locationObj.name);
          }
          _this.initSend = false;
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
          t = _this.byProjectResources === 'project' ? "Projects" : "Resources";
          $('.projects h4').html(size + " " + t);
          onPageElementsLoad();
          return _this.trigger("ON_RESULTS", size);
        }
      });
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
