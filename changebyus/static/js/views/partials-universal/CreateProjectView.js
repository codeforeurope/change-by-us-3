define(["underscore", "backbone", "jquery", "template", "form", "abstract-view"], function(_, Backbone, $, temp, form, AbstractView) {
  var CreateProjectView;
  CreateProjectView = AbstractView.extend({
    initialize: function(options) {
      AbstractView.prototype.initialize.apply(this, options);
      return this.render();
    },
    render: function() {
      var self;
      self = this;
      this.$el = $("<div class='create-project'/>");
      this.$el.template(this.templateDir + "/templates/partials-universal/create-form.html", {
        data: this.viewData
      }, function() {
        return self.ajaxForm();
      });
      return $(this.parent).append(this.$el);
    },
    ajaxForm: function() {
      var $form, $submit, options;
      $submit = $("input[type=submit]");
      $form = $("form[name=createproject]");
      options = {
        beforeSubmit: function() {
          return $submit.prop("disabled", true);
        },
        success: function(res) {
          console.log("res", res);
          $submit.prop("disabled", false);
          if (res.success) {
            return $form.resetForm();
          }
        }
      };
      return $form.ajaxForm(options);
    }
  });
  return CreateProjectView;
});
