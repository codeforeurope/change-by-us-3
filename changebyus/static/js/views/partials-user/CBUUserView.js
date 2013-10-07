define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel"], function(_, Backbone, $, temp, AbstractView, UserModel) {
  var CBUUserView;
  CBUUserView = AbstractView.extend({
    initialize: function(options) {
      var self;
      AbstractView.prototype.initialize.apply(this, options);
      self = this;
      console.log("options.model", options.model);
      this.model = new UserModel(options.model);
      return this.model.fetch({
        success: function() {
          return self.render();
        }
      });
    },
    render: function() {
      var self;
      console.log("this.model", this.model);
      self = this;
      this.$el = $("<div class='user'/>");
      this.$el.template(this.templateDir + "/templates/partials-user/user.html", {
        data: this.model.attributes
      }, function() {
        return self.ajaxForm();
      });
      return $(this.parent).append(this.$el);
    },
    ajaxForm: function() {
      var $signin;
      $signin = $("form[name=signin]");
      return $signin.ajaxForm(function(response) {
        return console.log(response);
      });
    }
  });
  return CBUUserView;
});
