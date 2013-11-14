define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProfileEditView;
  return ProfileEditView = AbstractView.extend({
    initialize: function(options) {
      console.log('ProfileEditView', options);
      AbstractView.prototype.initialize.call(this, options);
      this.viewData = this.model.attributes;
      return this.render();
    },
    render: function() {
      var _this = this;
      return $(this.parent).template(this.templateDir + "/templates/partials-user/profile-edit-form.html", {
        data: this.viewData
      }, function() {
        _this.ajaxForm();
        return onPageElementsLoad();
      });
    },
    ajaxForm: function() {
      var $feedback, $form, $projectLocation, $submit, options,
        _this = this;
      $('.fileupload').fileupload({
        uploadtype: 'image'
      });
      $submit = this.$el.find("input[type=submit]");
      $form = this.$el.find("form");
      $feedback = $("#feedback");
      options = {
        beforeSubmit: function() {
          if ($form.valid()) {
            $form.find("input, textarea").attr("disabled", "disabled");
            return true;
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
      $projectLocation = $("#location");
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
