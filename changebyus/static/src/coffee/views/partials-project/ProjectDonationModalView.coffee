define ["underscore", "backbone", "jquery", "template", "payment", "abstract-modal-view"],
    (_, Backbone, $, temp, payment, AbstractModalView) ->
        ProjectDonationModalView = AbstractModalView.extend

            render: ->
                console.log 'ProjectDonationModalView',@model
                
                @viewData = @model.attributes

                @$el = $("<div class='modal-fullscreen dark'/>") 
                @$el.template @templateDir+"/templates/partials-project/project-donation-modal.html",
                    {data: @viewData}, => @onTemplateLoad()
                $(@parent).append @$el 

            onTemplateLoad:->
                @setupStripe()
                AbstractModalView::onTemplateLoad.call @ 

            setupStripe:->
                # This identifies your website in the createToken call below
                Stripe.setPublishableKey @model.get('stripe_account').publishable_key

                $('[data-numeric]').payment('restrictNumeric');
                $('#charge-card-number').payment('formatCardNumber'); 
                $('#charge-cvc').payment('formatCardCVC');
                $('#charge-cvc').payment('formatCardCVC');
                $('#charge-expiry-month').payment('formatMonth');
                $('#charge-expiry-year').payment('formatYear');
                            
                $form = $("#payment-form")
                options =
                    type: $form.attr('method')
                    url: $form.attr('action')
                    dataType: "json" 
                    contentType: "application/json; charset=utf-8"
                    success: (response_) =>
                        if response_.success
                            $form.remove()
                            $feedback = $('<p class="modal-feedback"/>').append response_.msg
                            $('.modal-innerwrapper').append $feedback
                    error: (response_) => 
                        console.log 'error',response_

                stripeResponseHandler = (status, response) ->
                    if response.error 
                        # Show the errors on the form
                        $form.find(".payment-errors").css("display","block").text response.error.message
                        $form.find("button").prop "disabled", false
                    else
                        
                        # token contains id, last4, and card type
                        token = response.id
                        
                        # Insert the token into the form so it gets submitted to the server
                        $form.append $("<input type='hidden' name='stripeToken' />").val(token)

                        # and submit
                        options.data = JSON.stringify $form.serializeJSON()
                        $.ajax options

                $form.submit (event) ->
                    # Prevent the form from submitting with the default action
                    event.preventDefault()
                    
                    # Disable the submit button to prevent repeated clicks
                    $form.find("button").prop "disabled", true
                    Stripe.createToken $form, stripeResponseHandler

                    false
