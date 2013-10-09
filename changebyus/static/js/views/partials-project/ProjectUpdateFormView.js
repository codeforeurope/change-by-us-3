define(["underscore", "backbone", "jquery", "bootstrap", "template", "form", "prettify", "wysiwyg", "hotkeys", "abstract-view"], function(_, Backbone, $, bootstrap, temp, form, prettify, wysiwyg, hotkeys, AbstractView) {
  var ProjectUpdateFormView;
  return ProjectUpdateFormView = AbstractView.extend({
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var self;
      self = this;
      this.viewData = {
        project_id: window.projectID,
        response_id: "PLACEHOLDER"
      };
      this.$el = $("<div class='project-update-form'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-update-form.html", {
        data: this.viewData
      }, function() {
        return self.jQueryForm();
      });
      return $(this.parent).append(this.$el);
    },
    jQueryForm: function() {
      var $editor, $updateForm, editorOffset, options, showErrorAlert;
      showErrorAlert = function(reason, detail) {
        var msg;
        msg = "";
        if (reason === "unsupported-file-type") {
          msg = "Unsupported format " + detail;
        } else {
          console.log("error uploading file", reason, detail);
        }
        return $("<div class='alert'> <button type='button' class='close' data-dismiss='alert'>&times;</button>" + "<strong>File upload error</strong> " + msg + " </div>").prependTo("#alerts");
      };
      $editor = $("#editor");
      options = {
        beforeSubmit: function(arr, $form, options) {
          var i, _results;
          _results = [];
          for (i in arr) {
            console.log("obj.name", arr[i].name, arr[i]);
            if (arr[i].name === "description") {
              arr[i].value = escape($editor.html());
              _results.push(console.log('des', arr[i].value));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        },
        success: function(response) {
          return console.log(response);
        }
      };
      $updateForm = $("form[name='project-update']");
      $updateForm.ajaxForm(options);
      $("a[title]").tooltip({
        container: "body"
      });
      $(".dropdown-menu input").click(function() {
        return false;
      }).change(function() {
        return $(this).parent(".dropdown-menu").siblings(".dropdown-toggle").dropdown("toggle");
      }).keydown("esc", function() {
        this.value = "";
        return $(this).change();
      });
      $("[data-role=magic-overlay]").each(function() {
        var overlay, target;
        overlay = $(this);
        target = $(overlay.data("target"));
        return overlay.css("opacity", 0).css("position", "absolute").offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
      });
      if ("onwebkitspeechchange" in document.createElement("input")) {
        editorOffset = $("#editor").offset();
        $("#voiceBtn").css("position", "absolute").offset({
          top: editorOffset.top - 20,
          left: editorOffset.left + $("#editor").innerWidth() - 75
        });
      } else {
        $("#voiceBtn").hide();
      }
      $editor.wysiwyg({
        fileUploadError: showErrorAlert
      });
      return window.prettyPrint && prettyPrint();
    }
  });
});
