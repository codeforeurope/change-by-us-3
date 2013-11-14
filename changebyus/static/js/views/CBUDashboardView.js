define(["underscore", "backbone", "bootstrap-fileupload", "button", "jquery", "template", "abstract-view", "collection/ProjectListCollection", "model/UserModel", "resource-project-view"], function(_, Backbone, fileupload, button, $, temp, AbstractView, ProjectListCollection, UserModel, ResourceProjectPreviewView) {
  var CBUDashboardView;
  return CBUDashboardView = AbstractView.extend({
    location: {
      name: "",
      lat: 0,
      lon: 0
    },
    initialize: function(options) {
      var _this = this;
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.viewData = options.viewData || this.viewData;
      this.userModel = new UserModel({
        id: this.model.id
      });
      return this.userModel.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    render: function() {
      var _this = this;
      console.log('@userModel', this.userModel);
      this.$el.template(this.templateDir + "/templates/dashboard.html", {
        data: this.userModel.attributes
      }, function() {
        _this.onTemplateLoad();
        return _this.loadProjects();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var _this = this;
      return $('#edit-profile').template(this.templateDir + "/templates/partials-user/profile-edit-form.html", {
        data: this.userModel.attributes
      }, function() {
        _this.onProfileEditLoad();
        return _this.ajaxForm();
      });
    },
    onProfileEditLoad: function() {
      var _this = this;
      this.manageView = $('#manage-projects');
      this.followView = $('#follow-projects');
      this.profileView = $('#edit-profile');
      this.manageBTN = $("a[href='#manage']").parent();
      this.followBTN = $("a[href='#follow']").parent();
      this.profileBTN = $("a[href='#profile']").parent();
      $(window).bind("hashchange", function(e) {
        return _this.toggleSubView();
      });
      this.toggleSubView();
      return $("a[href^='#']").click(function(e) {
        return window.location.hash = $(this).attr("href").substring(1);
      });
    },
    toggleSubView: function() {
      var btn, v, view, _i, _j, _len, _len1, _ref, _ref1;
      view = window.location.hash.substring(1);
      _ref = [this.manageView, this.profileView, this.followView];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.hide();
      }
      _ref1 = [this.followBTN, this.profileBTN, this.manageBTN];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        btn = _ref1[_j];
        btn.removeClass("active");
      }
      switch (view) {
        case "follow":
          this.followView.show();
          return this.followBTN.addClass("active");
        case "profile":
          this.profileView.show();
          return this.profileBTN.addClass("active");
        default:
          this.manageView.show();
          return this.manageBTN.addClass("active");
      }
    },
    loadProjects: function() {
      this.joinedProjects = new ProjectListCollection({
        url: "/api/project/user/" + this.model.id + "/joinedprojects"
      });
      this.joinedProjects.on("reset", this.addJoined, this);
      this.joinedProjects.fetch({
        reset: true
      });
      this.ownedProjects = new ProjectListCollection({
        url: "/api/project/user/" + this.model.id + "/ownedprojects"
      });
      this.ownedProjects.on("reset", this.addOwned, this);
      return this.ownedProjects.fetch({
        reset: true
      });
    },
    addJoined: function() {
      var _this = this;
      return this.joinedProjects.each(function(projectModel) {
        return _this.addOne(projectModel, _this.followView.find("ul"), false, true);
      });
    },
    addOwned: function() {
      var _this = this;
      return this.ownedProjects.each(function(projectModel) {
        return _this.addOne(projectModel, _this.manageView.find("ul"), true, false);
      });
    },
    addOne: function(projectModel_, parent_, isOwned_, isFollowed_) {
      var view;
      if (isOwned_ == null) {
        isOwned_ = false;
      }
      if (isFollowed_ == null) {
        isFollowed_ = false;
      }
      view = new ResourceProjectPreviewView({
        model: projectModel_,
        isOwned: isOwned_,
        isFollowed: isFollowed_,
        isProject: true,
        isResource: false
      });
      return this.$el.find(parent_).append(view.$el);
    },
    ajaxForm: function() {
      var $feedback, $form, $projectLocation, $submit, options,
        _this = this;
      $('.fileupload').fileupload({
        uploadtype: 'image'
      });
      $submit = this.profileView.find("input[type=submit]");
      $form = this.profileView.find("form");
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
