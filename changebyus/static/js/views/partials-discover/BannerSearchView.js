define(["underscore", "backbone", "jquery", "template", "dropkick", "abstract-view", "autocomp", "model/ProjectModel", "resource-project-view"], function(_, Backbone, $, temp, dropkick, AbstractView, autocomp, ProjectModel, ResourceProjectPreviewView) {
  var BannerSearchView;
  return BannerSearchView = AbstractView.extend({
    byProjectResouces: 'Projects',
    sortByPopularDistance: 'Popular',
    locationObj: null,
    ajax: null,
    initSend: true,
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    events: {
      "click .search-catagories li": "categoriesClick",
      "focus #search-input": "showInput",
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
        _this.sendForm();
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var $dropkick,
        _this = this;
      $('#search-near').typeahead({
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
      $dropkick = $('#search-range').dropkick();
      this.$resultsModify = $('.results-modify');
      this.delegateEvents();
      return onPageElementsLoad();
    },
    categoriesClick: function(e) {
      $('#search-input').val($(e.currentTarget).html());
      return $('.search-catagories').hide();
    },
    pillSelection: function(e) {
      var $this;
      $this = $(e.currentTarget);
      $this.toggleClass('active');
      $this.siblings().toggleClass('active');
      switch ($this.html()) {
        case 'Projects':
          return this.byProjectResouces = 'Projects';
        case 'Resources':
          return this.byProjectResouces = 'Resources';
        case 'Popular':
          return this.sortByPopularDistance = 'Popular';
        case 'Distance':
          return this.sortByPopularDistance = 'Distance';
      }
    },
    showInput: function() {
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
    sendForm: function(e) {
      var dataObj,
        _this = this;
      if (e) {
        e.preventDefault();
      }
      $("#projects-list").html("");
      dataObj = {
        s: $("#search-input").val(),
        loc: $("#search-near").val(),
        d: $("select[name='range']").val(),
        type: this.byProjectResouces,
        sort: this.sortByPopularDistance,
        cat: $("#search-input").val()
      };
      if (this.ajax) {
        this.ajax.abort();
      }
      return this.ajax = $.ajax({
        type: "POST",
        url: "/api/project/search",
        data: dataObj
      }).done(function(response_) {
        var k, size, v, _ref;
        if (response_.success) {
          if (_this.initSend === false) {
            _this.toggleVisibility();
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
