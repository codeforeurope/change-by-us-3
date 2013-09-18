define(["underscore", 
        "backbone", 
        "jquery", 
        "bootstrap", 
        "template",
        "form",
        "prettify",
        "wysiwyg",
        "hotkeys",
        "views/partials/ProjectSubView"],

    function(_, 
             Backbone, 
             $, 
             bootstrap,
             temp, 
             form,
             prettify,
             wysiwyg,
             hotkeys,
             ProjectSubView) {
    
    var ProjectUpdateFormView = ProjectSubView.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || {};
            this.render();
        },

        render:function(){ 
            var self = this;
            this.viewData = {project_id:window.projectID, response_id:"PLACEHOLDER"};
            this.$el = $("<div class='project-update-form'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-update-form.html', {data:this.viewData}, function() {
                self.jQueryForm();
            });
            $(this.parent).append(this.$el);
        },

        jQueryForm:function(){ 
            // AJAXIFY THE FORM
            var $updateForm = $('form[name="project-update"]');
            $updateForm.ajaxForm(function(response) { 
                console.log(response);
            }); 
            
            $('a[title]').tooltip({container:'body'});
            
            $('.dropdown-menu input').click(function() {return false;})
              .change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');})
              .keydown('esc', function () {this.value='';$(this).change();});

            $('[data-role=magic-overlay]').each(function () { 
              var overlay = $(this), 
                  target = $(overlay.data('target')); 
              overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
            });
            
            if ("onwebkitspeechchange"  in document.createElement("input")) {
              var editorOffset = $('#editor').offset();
              $('#voiceBtn').css('position','absolute').offset({top: editorOffset.top-20, left: editorOffset.left+$('#editor').innerWidth()-75});
            } else {
              $('#voiceBtn').hide();
            }
            
            $('#editor').wysiwyg({ fileUploadError: showErrorAlert} );

            function showErrorAlert (reason, detail) {
                var msg='';
                if (reason==='unsupported-file-type') { msg = "Unsupported format " +detail; }
                else {
                    console.log("error uploading file", reason, detail);
                }
                $('<div class="alert"> <button type="button" class="close" data-dismiss="alert">&times;</button>'+ 
                 '<strong>File upload error</strong> '+msg+' </div>').prependTo('#alerts');
            }
            
            window.prettyPrint && prettyPrint();
        }
    });

    return ProjectUpdateFormView;
    
});


