define(["underscore", "backbone", "jquery", "template", "form", "abstract-view"], function(_, Backbone, $, temp, form, AbstractView) {
  var ProjectFundraisingView;
  return ProjectFundraisingView = AbstractView.extend({
    parent: "#project-calendar",
    name: "My Project",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.name = options.name || this.name;
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      if (this.started) {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-fundraising-goals.html", {
          data: this.viewData
        }, function() {
          return _this.onTemplateLoad();
        });
      } else {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-fundraising-get-started.html", {}, function() {
          return _this.getStarted();
        });
      }
    },
    getStarted: function() {
      var $how,
        _this = this;
      $how = $('.fundraising-left .content-wrapper');
      $how.slideToggle(1);
      $('#does-it-work').click(function(e) {
        return $how.slideToggle();
      });
      return $('.btn-large').click(function(e) {
        e.preventDefault();
        console.log('ProjectFundraisingView ');
        return $.ajax({
          type: "POST",
          url: "/stripe/link",
          data: {
            project_id: _this.id,
            project_name: _this.name
          }
        }).done(function(response_) {
          return popWindow(response_);
        });
      });
    }
  });
});
