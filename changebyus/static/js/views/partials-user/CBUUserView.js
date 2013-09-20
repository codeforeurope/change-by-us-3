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
            this.$el = $("<div class='user'/>");
            this.$el.template(this.templateDir + '/templates/partials-user/user.html', {data:this.model.attributes}, function() {});
            $(this.parent).append(this.$el); 
        }
 
    });

    return CBUUserView;
    
});


