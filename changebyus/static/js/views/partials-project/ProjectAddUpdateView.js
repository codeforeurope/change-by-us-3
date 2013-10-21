define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectWysiwygFormView"], function(_, Backbone, $, temp, AbstractView, ProjectWysiwygFormView) {
  var ProjectAddUpdateView;
  return ProjectAddUpdateView = AbstractView.extend({
    parent: "#project-update",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-project/project-add-update.html", {
        data: this.viewData
      }, function() {
        var $shareOptions, $shareToggle, form;
        form = new ProjectWysiwygFormView({
          parent: "#update-form"
        });
        form.beforeSubmit = function(arr_, form_, options_) {
          var share;
          share = [];
          if ($("#twitter").val() === "on") {
            share.push('twitter');
          }
          if ($("#facebook").val() === "on") {
            share.push('facebook');
          }
          return arr_.push({
            name: "social_sharing",
            value: share,
            type: "hidden",
            required: false
          });
        };
        $shareOptions = $(".share-options");
        $shareToggle = $(".share-toggle");
        return $shareToggle.click(function() {
          return $shareOptions.toggleClass("hide");
        });
      });
    }
  });
});
