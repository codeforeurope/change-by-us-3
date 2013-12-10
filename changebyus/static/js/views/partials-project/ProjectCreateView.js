define(["underscore", "backbone", "jquery", "template", "form", "abstract-view", "views/partials-project/ProjectCreateModalView", "bootstrap", "autocomp", "hogan", "validate", "dropkick"], function(_, Backbone, $, temp, form, AbstractView, ProjectCreateModalView, bootstrap, autocomp, Hogan, valid, dropkick) {
  var ProjectCreateView;
  return ProjectCreateView = AbstractView.extend({
    location: {
      name: "",
      lat: 0,
      lon: 0
    },
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='create-project'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-create-form.html", {
        data: this.viewData
      }, function() {
        onPageElementsLoad();
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
      $feedback = $("#feedback");
      $submit = $("input[type=submit]");
      $form = this.$el.find("form");
      options = {
        type: $form.attr('method'),
        url: $form.attr('action'),
        dataType: "json",
        contentType: "multipart/form-data; charset=utf-8",
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
          var modal;
          console.log('res', res);
          $form.find("input, textarea").removeAttr("disabled");
          if (res.success) {
            $form.resetForm();
            modal = new ProjectCreateModalView({
              viewData: res
            });
            return $feedback.hide();
          } else {
            $("html, body").animate({
              scrollTop: 0
            }, "slow");
            return $feedback.show().html(res.msg);
          }
        }
      };
      /*
      				$form.submit ->
      					json_str = JSON.stringify($form.serializeJSON())
      					options.data = json_str
      					console.log 'options.data',options.data
      					$.ajax options
      					false
      */

      $form.ajaxForm(options);
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
          }
        }
      }).bind('typeahead:selected', function(obj, datum) {
        _this.location = datum;
        $('input[name="location"]').val(_this.location.name);
        $('input[name="lat"]').val(_this.location.lat);
        $('input[name="lon"]').val(_this.location.lon);
        return console.log(datum);
      });
    }
  });
});
