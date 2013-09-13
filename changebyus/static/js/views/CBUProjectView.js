
define(["underscore", 
        "backbone", 
        "jquery", 
        "template",
        "views/partials/ProjectCalenderView",
        "views/partials/ProjectMembersView",
        "views/partials/ProjectUpdatesView",
        "collection/ProjectCalendarCollection",
        "collection/ProjectMemberCollection",
        "collection/ProjectUpdatesCollection"
        ],

 function(_, 
          Backbone, 
          $, 
          temp, 
          ProjectCalenderView, 
          ProjectMembersView, 
          ProjectUpdatesView, 
          ProjectCalendarCollection, 
          ProjectMemberCollection, 
          ProjectUpdatesCollection) {
    
    var CBUProjectView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},
        projectCalenderView:null,
        projectMembersView:null,
        projectUpdatesView:null,

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData; 
            this.collection  = options.collection || this.collection;
            this.render();
        },

        render:function(){
            var self = this;
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/project.html', {data:this.viewData}, function() {
                self.addSubViews();
            });
            $(this.parent).append(this.$el); 
        },

        addSubViews:function(){
            var projectCalendarCollection = new ProjectCalendarCollection({url:"/api/project/"+window.projectID+"/list_updates"}); 
            var projectMemberCollection   = new ProjectMemberCollection({url:"/api/project/"+window.projectID+"/user"}); 
            var projectUpdatesCollection  = new ProjectUpdatesCollection({url:"/api/project/"+window.projectID+"/calendar"});

            this.projectCalenderView = new ProjectCalenderView({parent:"#project-calender",collection:projectCalendarCollection});
            this.projectMembersView  = new ProjectMembersView({parent:"#project-members",collection:projectMemberCollection});
            this.projectUpdatesView  = new projectUpdatesView({parent:"#project-update",collection:projectUpdatesCollection});
        },

        toggleSubView:function(view){
            this.projectCalenderView.hide();
            this.projectMembersView.hide();
            this.projectUpdatesView.hide();

            switch(view){
                case "calendar":
                    this.projectCalenderView.show();
                    break;
                case "member":
                    this.projectMembersView.show();
                    break;
                case "update":
                    this.projectUpdatesView.show();
                    break;
            }
        }
    });

    return CBUProjectView;
    
});


