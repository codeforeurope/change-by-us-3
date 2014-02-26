define(["underscore", "backbone", "jquery", "template", "abstract-modal-view", "zeroclipboard"], function(_, Backbone, $, temp, AbstractModalView, ZeroClipboard) {
  var CreateModalView;
  return CreateModalView = AbstractModalView.extend({
    events: _.extend({}, AbstractModalView.prototype.events, {
      "click #copy-url": "copyUrl",
      "click #share-url": "shareUrl"
    }),
    render: function() {
      var _this = this;
      this.$el = $("<div class='modal-fullscreen dark'/>");
      this.$el.template(this.templateDir + "partials-universal/create-modal.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var $copyUrl, clip, noFlash;
      this.$initSuccess = $("#init-success");
      this.$shareSuccess = $("#share-success");
      $copyUrl = $("#copy-url");
      clip = new ZeroClipboard($copyUrl, {
        moviePath: "/static/swf/ZeroClipboard.swf"
      });
      clip.on("load", function(client) {
        return client.on("complete", function(client, args) {
          return $copyUrl.text("Copied!");
        });
      });
      clip.on("noFlash", function() {
        return noFlash();
      });
      clip.on("wrongFlash", function() {
        return noFlash();
      });
      noFlash = function() {
        $(".modal-links input").css("width", "100%");
        return $copyUrl.hide();
      };
      return AbstractModalView.prototype.onTemplateLoad.call(this);
    },
    shareUrl: function(e) {
      this.$initSuccess.toggle();
      return this.$shareSuccess.toggle();
    }
  });
});
