define(["underscore", "backbone", "jquery", "template", "abstract-modal-view"], function(_, Backbone, $, temp, AbstractModalView) {
  var ProjectDonationModalView;
  return ProjectDonationModalView = AbstractModalView.extend({
    render: function() {
      var _this = this;
      console.log('ProjectDonationModalView', this.model);
      this.viewData = this.model.attributes;
      this.$el = $("<div class='modal-fullscreen dark'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-donation-modal.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      this.setupStripe();
      return AbstractModalView.prototype.onTemplateLoad.call(this);
    },
    setupStripe: function() {
      var $form, options, stripeResponseHandler,
        _this = this;
      Stripe.setPublishableKey(this.model.get('stripe_account').publishable_key);
      $form = $("#payment-form");
      options = {
        type: $form.attr('method'),
        url: $form.attr('action'),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(response_) {
          var $feedback;
          if (response_.success) {
            $form.remove();
            $feedback = $('<p class="modal-feedback"/>').append(response_.msg);
            return $('.modal-innerwrapper').append($feedback);
          }
          /*
          						$form.get(0).reset()
          						$form.find("input[name='stripeToken']").remove()
          */

        },
        error: function(response_) {
          return console.log('error', response_);
        }
      };
      stripeResponseHandler = function(status, response) {
        var token;
        if (response.error) {
          $form.find(".payment-errors").text(response.error.message);
          return $form.find("button").prop("disabled", false);
        } else {
          token = response.id;
          $form.append($("<input type='hidden' name='stripeToken' />").val(token));
          options.data = JSON.stringify($form.serializeJSON());
          return $.ajax(options);
        }
      };
      return $form.submit(function(event) {
        event.preventDefault();
        $form = $(this);
        $form.find("button").prop("disabled", true);
        Stripe.createToken($form, stripeResponseHandler);
        return false;
      });
    }
  });
});
