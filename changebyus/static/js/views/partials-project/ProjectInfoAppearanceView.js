define(["underscore", "backbone", "jquery", "template", "abstract-view", "dropkick"], function(_, Backbone, $, temp, AbstractView, dropkick) {
  var ProjectInfoAppearanceView;
  return ProjectInfoAppearanceView = AbstractView.extend({
    parent: "#project-info",
    location: {
      name: "",
      lat: 0,
      lon: 0
    },
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      this.viewData = this.model.attributes;
      this.location.name = this.viewData.location;
      console.log('@viewData', this.viewData);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div />");
      this.$el.template(this.templateDir + "/templates/partials-project/project-info-appearance.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      AbstractView.prototype.onTemplateLoad.call(this);
      return this.ajaxForm();
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
      $feedback = $("#info-feedback");
      options = {
        type: $form.attr('method'),
        url: $form.attr('action'),
        dataType: "json",
        contentType: "multipart/form-data; charset=utf-8",
        beforeSubmit: function() {
          var $zip;
          if ($form.valid()) {
            $zip = $('input[name="zip"]');
            console.log('$zip.val()  @location.name ', $zip, $zip.val(), _this.location.name);
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
              scrollTop: $feedback.offset().top
            }, "slow");
            return $feedback.addClass('alert-success').removeClass('alert-error');
          } else {
            return $feedback.removeClass('alert-success').addClass('alert-error');
          }
        }
      };
      $form.ajaxForm(options);
      $projectLocation = $("#project_location");
      $projectLocation.typeahead({
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
        _this.location = datum;
        $('input[name="location"]').val(_this.location.name);
        $('input[name="lat"]').val(_this.location.lat);
        $('input[name="lon"]').val(_this.location.lon);
        return console.log(datum);
      });
      return this.$el.find('input:radio').screwDefaultButtons({
        image: 'url("/static/img/icon-lock.png")',
        width: 60,
        height: 25
      });
    }
  });
});
