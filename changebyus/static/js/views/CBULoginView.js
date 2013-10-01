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

    function popWindow(url) {
        var title   = "social",
            w       = 650,
            h       = 650,
            left    = (screen.width/2)-(w/2),
            top     = (screen.height/2)-(h/2);

        window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    }

    return CBUDLoginView;
    
});