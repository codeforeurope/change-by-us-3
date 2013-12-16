define(["underscore", "backbone", "jquery", "bootstrap", "template", "form", "prettify", "wysiwyg", "hotkeys", "abstract-view"], function(_, Backbone, $, bootstrap, temp, form, prettify, wysiwyg, hotkeys, AbstractView) {
  var WysiwygFormView;
  return WysiwygFormView = AbstractView.extend({
    formName: "project-update",
    editorID: "#editor",
    slim: false,
    userAvatar: "",
    $updateForm: null,
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.slim = options.slim || this.slim;
      this.userAvatar = options.userAvatar || this.userAvatar;
      return this.render();
    },
    render: function() {
      var url,
        _this = this;
      this.viewData = {
        project_id: window.projectID,
        response_to_id: this.id,
        editorID: this.editorID,
        slim: this.slim,
        userAvatar: this.userAvatar
      };
      if (this.parent === "#update-form") {
        url = "/templates/partials-project/project-update-form.html";
        this.editorID = "#editor";
        this.formName = "project-update";
        this.$el = $("<div class='update-wrapper thin-pad clearfix'/>");
      } else if (this.parent === "#add-thread-form") {
        url = "/templates/partials-project/project-new-thread-form.html";
        this.editorID = "#new-thread-editor";
        this.formName = "new-discussion";
        this.$el = $("<div class='content-wrapper thin-pad clearfix'/>");
      } else {
        url = "/templates/partials-project/project-new-discussion-form.html";
        this.editorID = "#discussion-editor";
        this.formName = "new-thread";
        this.$el = $("<div class='content-wrapper thin-pad clearfix'/>");
      }
      this.$el.template(this.templateDir + url, {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      this.trigger('ON_TEMPLATE_LOAD');
      this.ajaxForm();
      return onPageElementsLoad();
    },
    ajaxForm: function() {
      var $editor, options, showErrorAlert,
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
      this.$updateForm = this.$el.find("form");
      options = {
        type: this.$updateForm.attr('method'),
        url: this.$updateForm.attr('action'),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(response_) {
          return _this.success(response_);
        }
      };
      this.$updateForm.submit(function() {
        var json_str, obj;
        obj = _this.$updateForm.serializeJSON();
        obj.description = escape($editor.html());
        json_str = JSON.stringify(obj);
        options.data = json_str;
        $.ajax(options);
        return false;
      });
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
      /*
      				if "onwebkitspeechchange" of document.createElement("input")
      					editorOffset = $editor.offset()
      					if editorOffset
      						$("#voiceBtn").css("position", "absolute").offset
      							top: editorOffset.top - 20
      							left: editorOffset.left + $editor.innerWidth() - 75
      				else
      					$("#voiceBtn").hide()
      */

      $("#voiceBtn").hide();
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
