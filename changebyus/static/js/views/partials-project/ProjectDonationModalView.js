define(["underscore", "backbone", "jquery", "template", "payment", "abstract-modal-view"], function(_, Backbone, $, temp, payment, AbstractModalView) {
  var ProjectDonationModalView;
  return ProjectDonationModalView = AbstractModalView.extend({
    render: function() {
      var _this = this;
      this.viewData = this.model.attributes;
      this.$el = $("<div class='modal-fullscreen dark'/>");
      this.$el.template(this.templateDir + "partials-project/project-donation-modal.html", {
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
      $('[data-numeric]').payment('restrictNumeric');
      $('#charge-card-number').payment('formatCardNumber');
      $('#charge-cvc').payment('formatCardCVC');
      $('#charge-cvc').payment('formatCardCVC');
      $('#charge-expiry-month').payment('formatMonth');
      $('#charge-expiry-year').payment('formatYear');
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
        },
        error: function(response_) {
          return console.log('error', response_);
        }
      };
      stripeResponseHandler = function(status, response) {
        var token;
        if (response.error) {
          $form.find(".payment-errors").css("display", "block").text(response.error.message);
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
        $form.find("button").prop("disabled", true);
        Stripe.createToken($form, stripeResponseHandler);
        return false;
      });
    }
  });
});
