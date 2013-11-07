define(["underscore", "backbone", "jquery", "template", "abstract-view", "autocomp", "model/ProjectModel", "views/partials-project/ProjectPartialsView"], function(_, Backbone, $, temp, AbstractView, autocomp, ProjectModel, ProjectPartialsView) {
  var BannerSearchView;
  return BannerSearchView = AbstractView.extend({
    sortByProjectResouces: 'Projects',
    sortByPopularDistance: 'Popular',
    locationObj: null,
    ajax: null,
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='banner-search'/>");
      this.$el.template(this.templateDir + "/templates/partials-discover/banner-search.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var $searchCatagories, $searchInput, $searchNear,
        _this = this;
      $searchCatagories = $('.search-catagories');
      $searchInput = $('#search-input');
      $searchInput.focus(function() {
        return $searchCatagories.show();
      });
      $searchNear = $('#search-near');
      $searchNear.typeahead({
        template: '<div class="zip">{{ name }}</div>',
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
                  'lon': loc.lon
                });
              }
            }
            return zips;
          }
        }
      }).bind('typeahead:selected', function(obj, datum) {
        _this.locationObj = datum;
        return console.log(datum);
      });
      $('li').click(function() {
        $searchInput.val($(this).html());
        return $searchCatagories.hide();
      });
      $('.pill-selection').click(function() {
        var $this;
        $this = $(this);
        $this.toggleClass('active');
        $this.siblings().toggleClass('active');
        switch ($this.html()) {
          case 'Projects':
            return this.sortByProjectResouces = 'Projects';
          case 'Resources':
            return this.sortByProjectResouces = 'Resources';
          case 'Popular':
            return this.sortByPopularDistance = 'Popular';
          case 'Distance':
            return this.sortByPopularDistance = 'Distance';
        }
      });
      return $('.search-inputs .btn').click(function() {
        return _this.sendForm();
      });
    },
    sendForm: function() {
      var dataObj,
        _this = this;
      dataObj = {
        s: $("#search-input").val(),
        loc: $("#search-near").val(),
        d: $("select[name='range']").val(),
        type: this.sortByProjectResouces,
        cat: this.sortByPopularDistance
      };
      if (this.ajax) {
        this.ajax.abort();
      }
      return this.ajax = $.ajax({
        type: "POST",
        url: "/api/project/search",
        data: dataObj
      }).done(function(response_) {
        var k, v, _ref, _results;
        if (response_.msg.toLowerCase() === "ok") {
          _ref = response_.data;
          _results = [];
          for (k in _ref) {
            v = _ref[k];
            _results.push(_this.addProject(v._id));
          }
          return _results;
        }
      });
    },
    addProject: function(id_) {
      var projectModel, view;
      projectModel = new ProjectModel({
        id: id_
      });
      view = new ProjectPartialsView({
        model: projectModel,
        parent: "#projects-list"
      });
      return view.fetch();
    }
  });
});
