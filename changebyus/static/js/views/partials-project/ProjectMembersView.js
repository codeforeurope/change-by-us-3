define(["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "views/partials-project/ProjectSubView", 
        "views/partials-project/ProjectMemberListItemView" ], 
    function(_, 
             Backbone, 
             $, 
             temp, 
             ProjectSubView, 
             ProjectMemberListItemView) {
    
    var ProjectMembersView = ProjectSubView.extend({
        parent:"#project-members",
        $teamList:null,
        $memberList:null,
        
        render:function(){ 
            var self = this;
            this.$el = $("<div class='project'/>");
            // data:this.viewData
            this.$el.template(this.templateDir + '/templates/partials-project/project-members.html', {}, function() {
                self.$el.find('.preload').remove();
                self.$teamList   = self.$el.find('#team-members ul');
                self.$memberList = self.$el.find('#project-members ul');
            });
            $(this.parent).append(this.$el); 

        },
        
        addOne: function(model) {
            //to do 
            var view = new ProjectMemberListItemView({model:model});
            this.$teamList.append(view.el);
        }
    });

    return ProjectMembersView;
    
});


