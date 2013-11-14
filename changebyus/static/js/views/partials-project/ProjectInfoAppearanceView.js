define(["underscore", "backbone", "jquery", "template", "abstract-view", "dropkick"], function(_, Backbone, $, temp, AbstractView, dropkick) {
  var ProjectInfoAppearanceView;
  return ProjectInfoAppearanceView = AbstractView.extend({
    parent: "#project-info",
    location: {
      name: "",
      lat: 0,
      lon: 0
    },
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.viewData = this.model.attributes;
      console.log('@viewData', this.viewData);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div />");
      this.$el.template(this.templateDir + "/templates/partials-project/project-info-appearance.html", {
        data: this.viewData
      }, function() {
        return _this.ajaxForm();
      });
      return $(this.parent).append(this.$el);
    },
    ajaxForm: function() {
      var $dropkick, $feedback, $form, $projectLocation, $submit, options,
        _this = this;
      $('.fileupload').fileupload({
        uploadtype: 'image'
      });
      $dropkick = $('#project-category').dropkick();
      $submit = $("input[type=submit]");
      $form = this.$el.find("form");
      $feedback = $("#feedback");
      options = {
        beforeSubmit: function() {
          var $zip;
          if ($form.valid()) {
            $zip = $('input[name="zip"]');
            if (_this.location.name !== "" && _this.location.name === $zip.val()) {
              $form.find("input, textarea").attr("disabled", "disabled");
              return true;
            } else {
              if ($zip.val() === "") {
                console.log('# zip warning');
              } else {
                console.log('# zip show');
                $('.tt-dropdown-menu').show();
              }
              return false;
            }
          } else {
            return false;
          }
        },
        success: function(res) {
          var msg;
          msg = res.msg.toLowerCase() === "ok" ? "Updated Successfully" : res.msg;
          $feedback.show().html(msg);
          $form.find("input, textarea").removeAttr("disabled");
          if (res.success) {
            $("html, body").animate({
              scrollTop: 0
            }, "slow");
            return $feedback.addClass('.alert-success').removeClass('.alert-error');
          } else {
            return $feedback.removeClass('.alert-success').addClass('.alert-error');
          }
        }
      };
      $form.ajaxForm(options);
      $projectLocation = $("#project_location");
      $projectLocation.typeahead({
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
        _this.location = datum;
        $('input[name="location"]').val(_this.location.name);
        $('input[name="lat"]').val(_this.location.lat);
        $('input[name="lon"]').val(_this.location.lon);
        return console.log(datum);
      });
      return $('input:radio').screwDefaultButtons({
        image: 'url("/static/img/black-check.png")',
        width: 18,
        height: 18
      });
    }
  });
});
