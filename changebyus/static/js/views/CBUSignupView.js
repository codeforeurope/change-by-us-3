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
                 self.ajaxForm();
                 self.addListeners();
            });
            $(this.parent).append(this.$el); 
        },

        addListeners:function(){
            $('.btn-info').click(function(e){
                e.preventDefault();
                var url = $(this).attr('href');
                popWindow(url);
            })
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

    function popWindow(url) {
        var title   = "social",
            w       = 650,
            h       = 650,
            left    = (screen.width/2)-(w/2),
            top     = (screen.height/2)-(h/2);

        window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    }

    return CBUSignupView;
    
});