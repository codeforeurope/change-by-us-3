define(["underscore", "backbone", "jquery", "template", "form", "abstract-view"], function(_, Backbone, $, temp, form, AbstractView) {
  var ProjectFundraisingView;
  return ProjectFundraisingView = AbstractView.extend({
    parent: "#project-calendar",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      if (this.started) {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-fundraising-goals.html", {
          data: this.viewData
        }, function() {});
      } else {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-fundraising-get-started.html", {}, function() {
          return _this.getStarted();
        });
      }
    },
    getStarted: function() {
      var _this = this;
      return $('.btn-large').click(function(e) {
        e.preventDefault();
        console.log('here');
        return $.ajax({
          url: "/stripe/link",
          context: document.body,
          data: {
            project_id: _this.id,
            project_name: _this.name
          }
        }).done(function(response) {
          return console.log('more', response);
        });
        /*
        					options =
        					success: (response) ->
        						console.log response
        
        				@$el.find('form').ajaxForm options
        */

      });
    }
  });
});
