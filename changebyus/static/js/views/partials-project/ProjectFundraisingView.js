define(["underscore", "backbone", "jquery", "template", "form", "abstract-view"], function(_, Backbone, $, temp, form, AbstractView) {
  var ProjectFundraisingView;
  return ProjectFundraisingView = AbstractView.extend({
    parent: "#project-fundraising",
    name: "My Project",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.name = options.name || this.name;
      return this.render();
    },
    events: {
      "click .btn-large": "linkStripe",
      "click #does-it-work": "slideToggle"
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
      this.$how = $('.fundraising-left .content-wrapper');
      return this.$how.slideToggle(1);
    },
    linkStripe: function(e) {
      var dataObj,
        _this = this;
      e.preventDefault();
      dataObj = {
        project_id: this.id,
        project_name: this.name
      };
      return $.ajax({
        type: "POST",
        url: "/stripe/link",
        data: JSON.stringify(dataObj),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).done(function(response_) {
        return popWindow(response_);
      });
    },
    slideToggle: function() {
      return this.$how.slideToggle();
    }
  });
});
