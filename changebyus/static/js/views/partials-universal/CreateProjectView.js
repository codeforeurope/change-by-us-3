define(["underscore", "backbone", "jquery", "template", "form", "abstract-view", "bootstrap", "autocomp", "hogan"], function(_, Backbone, $, temp, form, AbstractView, bootstrap, autocomp, Hogan) {
  var CreateProjectView;
  return CreateProjectView = AbstractView.extend({
    location: {
      name: "",
      lat: 0.0,
      lon: 0.0
    },
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='create-project'/>");
      this.$el.template(this.templateDir + "/templates/partials-universal/create-form.html", {
        data: this.viewData
      }, function() {
        return _this.ajaxForm();
      });
      return $(this.parent).append(this.$el);
    },
    ajaxForm: function() {
      var $ajax, $form, $projectLocation, $submit, options;
      $submit = $("input[type=submit]");
      $form = this.$el.find("form");
      options = {
        beforeSubmit: function() {
          return $submit.prop("disabled", true);
        },
        success: function(res) {
          console.log("res", res);
          $submit.prop("disabled", false);
          if (res.success) {
            $form.resetForm();
            return window.location = "/project/" + res.data.id;
          } else {

          }
        }
      };
      $form.ajaxForm(options);
      $ajax = null;
      $projectLocation = $("#project_location");
      return $projectLocation.typeahead({
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
          },
          select: function() {
            return console.log('select', this);
          },
          onselect: function() {
            return console.log('onselect', this);
          }
        }
      }).bind('typeahead:selected', function(obj, datum) {
        this.location = datum;
        return console.log(datum);
      });
    }
  });
});
