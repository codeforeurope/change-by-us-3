define(["underscore", "backbone", "jquery", "template", "form", "abstract-modal-view"], function(_, Backbone, $, temp, form, AbstractModalView) {
  var ProjectEmbedCalendarModalView;
  return ProjectEmbedCalendarModalView = AbstractModalView.extend({
    initialize: function(options_) {
      AbstractModalView.prototype.initialize.call(this, options_);
      this.viewData.id = this.model.id;
      return this.viewData.slug = this.model.slug;
    },
    events: _.extend({}, AbstractModalView.prototype.events, {
      "click #modal-does-it-work": "slideToggle"
    }),
    render: function() {
      var _this = this;
      this.$el = $("<div class='modal-fullscreen dark'/>");
      this.$el.template(this.templateDir + "partials-project/project-embed-calendar.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var $form, options;
      $form = this.$el.find('form');
      this.$how = this.$el.find('.content-wrapper');
      this.$how.hide();
      options = {
        type: $form.attr('method'),
        url: $form.attr('action'),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(response_) {
          if (response_.success) {
            return window.location.reload();
          }
        }
      };
      $form.submit(function() {
        var json_str, obj;
        obj = $form.serializeJSON();
        json_str = JSON.stringify(obj);
        options.data = json_str;
        $.ajax(options);
        return false;
      });
      return AbstractModalView.prototype.onTemplateLoad.call(this);
    },
    slideToggle: function(e) {
      var isExpanded, mt;
      isExpanded = this.$how.is(":visible");
      mt = isExpanded ? -185 : -335;
      this.$el.find(".embed-modal").css("margin-top", mt);
      this.$how.slideToggle();
      return this.$el.find("form").toggle();
    }
  });
});
