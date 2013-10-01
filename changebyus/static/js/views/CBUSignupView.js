define(["underscore", 
        "backbone", 
        "jquery", 
        "template"], 
        
    function(_, 
             Backbone, 
             $, 
             temp) {
    
    var CBUSignupView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{}, 

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData;
            this.render();
        },

        render:function(){ 
            self = this;
            this.$el = $("<div class='signup'/>");
            this.$el.template(this.templateDir + '/templates/signup.html', {data:this.viewData}, function() { 
                 //self.ajaxForm();
            });
            $(this.parent).append(this.$el); 
        },

        ajaxForm:function(){
            var $signin = $('form[name=signin]');
            $signin.ajaxForm(function(response) { 
                console.log(response);
                // to do
                // if (success){}
                // if (failure){}
            }); 
        }
    });

    return CBUSignupView;
    
});