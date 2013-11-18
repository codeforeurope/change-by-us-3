define(["underscore", "backbone", "jquery", "bootstrap", "template", "form", "prettify", "wysiwyg", "hotkeys", "abstract-view"], function(_, Backbone, $, bootstrap, temp, form, prettify, wysiwyg, hotkeys, AbstractView) {
  var ProjectWysiwygFormView;
  return ProjectWysiwygFormView = AbstractView.extend({
    formName: "project-update",
    editorID: "#editor",
    $updateForm: null,
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var url,
        _this = this;
      this.viewData = {
        project_id: window.projectID,
        response_to_id: this.id,
        editorID: this.editorID
      };
      if (this.parent === "#update-form") {
        url = "/templates/partials-project/project-update-form.html";
        this.editorID = "#editor";
        this.formName = "project-update";
      } else if (this.parent === "#add-thread-form") {
        url = "/templates/partials-project/project-new-thread-form.html";
        this.editorID = "#new-thread-editor";
        this.formName = "new-discussion";
      } else {
        url = "/templates/partials-project/project-new-discussion-form.html";
        this.editorID = "#discussion-editor";
        this.formName = "new-thread";
      }
      this.$el = $("<div class='content-wrapper'/>");
      this.$el.template(this.templateDir + url, {
        data: this.viewData
      }, function() {
        return _this.ajaxForm();
      });
      return $(this.parent).append(this.$el);
    },
    ajaxForm: function() {
      var $editor, editorOffset, options, showErrorAlert,
        _this = this;
      showErrorAlert = function(reason, detail) {
        var msg;
        msg = "";
        if (reason === "unsupported-file-type") {
          msg = "Unsupported format " + detail;
        } else {
          console.log("error uploading file", reason, detail);
        }
        return $("<div class='alert'> <button type='button' class='close' data-dismiss='alert'>&times;</button><strong>File upload error</strong> " + msg + " </div>").prependTo("#alerts");
      };
      $editor = $(this.editorID);
      console.log('$editor', $editor, this.editorID);
      options = {
        beforeSubmit: function(arr_, form_, options_) {
          var i, _results;
          _this.beforeSubmit(arr_, form_, options_);
          _results = [];
          for (i in arr_) {
            console.log("obj.name", arr_[i].name, arr_[i], $editor);
            if (arr_[i].name === "description") {
              arr_[i].value = escape($editor.html());
              _results.push(console.log('des', arr_[i].value));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        },
        success: function(response_) {
          _this.success(response_);
          return console.log(response_);
        }
      };
      this.$updateForm = this.$el.find("form");
      this.$updateForm.ajaxForm(options);
      console.log("$updateForm", this.$updateForm);
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
        editorOffset = $editor.offset();
        if (editorOffset) {
          $("#voiceBtn").css("position", "absolute").offset({
            top: editorOffset.top - 20,
            left: editorOffset.left + $editor.innerWidth() - 75
          });
        }
      } else {
        $("#voiceBtn").hide();
      }
      $editor.wysiwyg({
        fileUploadError: showErrorAlert
      });
      return window.prettyPrint && prettyPrint();
    },
    beforeSubmit: function(arr_, form_, options_) {},
    success: function(response_) {},
    resetForm: function() {
      return this.$updateForm.resetForm();
    }
  });
});
