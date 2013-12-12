define(["underscore", "backbone", "jquery", "template", "abstract-view", "serializeObject"], function(_, Backbone, $, temp, AbstractView, serializeObject) {
  var ProfileEditView;
  return ProfileEditView = AbstractView.extend({
    initialize: function(options) {
      var _this = this;
      console.log('ProfileEditView', options);
      AbstractView.prototype.initialize.call(this, options);
      this.viewData = this.model.attributes;
      return $.get("/api/user/socialstatus", function(response_) {
        var e;
        try {
          _this.viewData.facebook = response_.data.facebook;
          _this.viewData.twitter = response_.data.twitter;
        } catch (_error) {
          e = _error;
        }
        return _this.render();
      });
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-user/profile-edit-form.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoaded();
      });
    },
    onTemplateLoaded: function() {
      $(".social-btns .btn-primary").click(function(e) {
        var url;
        e.preventDefault();
        url = $(this).attr("href");
        return popWindow(url);
      });
      this.ajaxForm();
      return onPageElementsLoad();
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
        type: $form.attr('method'),
        url: $form.attr('action'),
        dataType: "json",
        contentType: "multipart/form-data; charset=utf-8",
        beforeSubmit: function(arr_, form_, options_) {
          var i, showEmail;
          if ($form.valid()) {
            showEmail = true;
            for (i in arr_) {
              if (arr_[i].name === "public_email") {
                showEmail = false;
                break;
              }
            }
            if (showEmail) {
              arr_.push({
                name: "public_email",
                value: false
              });
            }
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
      /*
      				$form.submit ->
      					obj = $form.serializeJSON()
      					if obj.public_email is "on" then obj.public_email=true else obj.public_email=false
      					json_str = JSON.stringify(obj)
      					options.data = json_str
      					console.log 'options.data',options.data
      					$.ajax options
      					false
      */

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
      return $('input:radio, input:checkbox').screwDefaultButtons({
        image: 'url("/static/img/black-check.png")',
        width: 18,
        height: 18
      });
    }
  });
});
