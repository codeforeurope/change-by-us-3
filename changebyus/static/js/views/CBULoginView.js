define(["underscore", 
        "backbone", 
        "jquery", 
        "template"], 
        
    function(_, 
             Backbone, 
             $, 
             temp) {
    
    var CBUDLoginView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{}, 
        $submit:null,

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData;  
            this.render();
        },

        render:function(){ 
            var self = this;
            this.$el = $("<div class='login'/>");
            this.$el.template(this.templateDir + '/templates/login.html', {data:this.viewData}, function() {
                self.$submit = $('input[type="submit"]');
                self.ajaxForm();
             });
            $(this.parent).append(this.$el); 
        },

        ajaxForm:function(){
            var self = this,
                $login = $('form[name=signin]'),
                $feedback = $('#login-feedback'),
                options = { 
                    beforeSubmit: function() { 
                        self.$submit.prop('disabled', true);
                        $feedback.removeClass('alert').html('');
                    },
                    success: function(response) { 
                        self.$submit.prop('disabled', false);
                        if (response.msg.toLowerCase() == "ok"){
                            window.location.href = "/";
                        }else{
                            $feedback.addClass('alert').html(response.msg);
                        }
                    }
                }
            $login.ajaxForm(options); 
        }
    });

    return CBUDLoginView;
    
});