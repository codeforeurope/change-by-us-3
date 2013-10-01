define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel"], 
    function(_, Backbone, $, temp, AbstractView, UserModel) {
    
    var CBUUserView = AbstractView.extend({

        initialize: function(options) {
            AbstractView.prototype.initialize.apply(this, options);

            var self = this;    
            console.log('options.model',options.model);

            this.model = new UserModel(options.model);
            this.model.fetch({
                success:function(){ self.render(); }
            });
        },

        render:function(){ 
            console.log('this.model',this.model);
            self = this;
            this.$el = $("<div class='user'/>");
            this.$el.template(this.templateDir + '/templates/partials-user/user.html', {data:this.model.attributes}, function() {
                 self.ajaxForm();
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

    return CBUUserView;
    
});


