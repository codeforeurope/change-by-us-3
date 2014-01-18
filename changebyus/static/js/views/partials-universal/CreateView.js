define(["underscore", "backbone", "jquery", "template", "form", "abstract-view", "views/partials-universal/CreateModalView", "bootstrap", "autocomp", "hogan", "validate", "dropkick", "button"], function(_, Backbone, $, temp, form, AbstractView, CreateModalView, bootstrap, autocomp, Hogan, valid, dropkick, button) {
  var CreateView;
  return CreateView = AbstractView.extend({
    location: {
      name: "",
      lat: 0,
      lon: 0
    },
    isResource: false,
    initialize: function(options_) {
      var options;
      options = options_;
      AbstractView.prototype.initialize.call(this, options);
      this.isResource = options.isResource || this.isResource;
      return this.render();
    },
    render: function() {
      var templateURL,
        _this = this;
      templateURL = this.isResource ? "/templates/partials-resource/resource-create-form.html" : "/templates/partials-project/project-create-form.html";
      this.$el = $("<div class='create-project'/>");
      this.$el.template(this.templateDir + templateURL, {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      this.$el.find('input:radio').screwDefaultButtons({
        image: 'url("/static/img/dot-check.png")',
        width: 25,
        height: 25
      });
      this.ajaxForm();
      $('input[name="visibility"]').change(function() {
        return $('input[name="private"]').attr('checked', $(this).val() === "private");
      });
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    ajaxForm: function() {
      var $dropkick, $feedback, $form, $location, $submit, isResource, options,
        _this = this;
      $('.fileupload').fileupload({
        uploadtype: 'image'
      });
      $dropkick = $('#project-category').dropkick();
      $feedback = $("#feedback");
      isResource = this.isResource;
      $submit = $("input[type=submit]");
      $form = this.$el.find("form");
      options = {
        type: $form.attr('method'),
        url: $form.attr('action'),
        dataType: "json",
        contentType: "multipart/form-data; charset=utf-8",
        beforeSubmit: function(arr, $form, options) {
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
        success: function(res_) {
          var config, modal;
          $form.find("input, textarea").removeAttr("disabled");
          if (res_.success) {
            config = {};
            config.viewData = res_;
            config.viewData.isResource = isResource;
            $form.resetForm();
            modal = new CreateModalView(config);
            return $feedback.hide();
          } else {
            $("html, body").animate({
              scrollTop: 0
            }, "slow");
            return $feedback.show().html(res_.msg);
          }
        }
      };
      $form.ajaxForm(options);
      $location = this.isResource ? $("#resource_location") : $("#project_location");
      return $location.typeahead({
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
    }
  });
});
