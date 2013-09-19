define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var ProjectCalenderView = ProjectSubView.extend({
        parent:"#project-calendar",

        render:function(){
            var self = this;
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-calendar.html', {data:this.viewData}, function() {
                self.$el.find('.preload').remove();
            });
            $(this.parent).append(this.$el);
            //console.log($(this.parent),this.$el);
        },
        
        addOne: function(model) {
            //to do 
            //var view = new Partial(); 
            //this.$el.append(view);
        }
 
    });

    return ProjectCalenderView;
    
});


