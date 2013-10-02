define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectAddUpdateView;
  ProjectAddUpdateView = AbstractView.extend({
    parent: "#project",
    initialize: function(options) {
      AbstractView.prototype.initialize.apply(this, options);
      return this.render();
    },
    render: function() {
      var self;
      self = this;
      this.$el = $("<div class='project'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-add-update.html", {
        data: this.viewData
      }, function() {
        return self.ajaxForm();
      });
      return $(this.parent).append(this.$el);
    },
    ajaxForm: function() {
      var $signin;
      $signin = $("form[name=add-update]");
      return $signin.ajaxForm(function(response) {});
    }
  });
  return ProjectAddUpdateView;
});
