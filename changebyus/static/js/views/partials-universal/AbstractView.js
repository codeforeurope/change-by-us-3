define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
  var AbstractView;
  return AbstractView = Backbone.View.extend({
    parent: "body",
    templateDir: "/static/templates/",
    viewData: {},
    templateLoaded: false,
    delayedCollectionLoad: false,
    $paginationContainer: null,
    id: 0,
    results: [],
    index: 0,
    perPage: 12,
    pages: 0,
    initialize: function(options_) {
      var options;
      options = options_ || {};
      this.id = options.id || this.id;
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      return this.viewData = options.viewData || this.viewData;
    },
    events: {
      "click .next-arrow": "nextClick",
      "click .prev-arrow": "prevClick",
      "click .page": "pageClick"
    },
    onTemplateLoad: function() {
      this.trigger('ON_TEMPLATE_LOAD');
      this.templateLoaded = true;
      if (this.delayedCollectionLoad) {
        this.loadData();
      }
      this.delegateEvents();
      return onPageElementsLoad();
    },
    changeHash: function(e) {
      return window.location.hash = $(e.currentTarget).attr("href").substring(1);
    },
    show: function() {
      return this.$el.show();
    },
    hide: function() {
      return this.$el.hide();
    },
    fetch: function() {
      var _this = this;
      return this.model.fetch({
        success: function(r) {
          return _this.onFetch(r);
        }
      });
    },
    onFetch: function(r) {},
    nextClick: function(e) {
      e.preventDefault();
      if ($(e.currentTarget).hasClass('disabled') === false) {
        return this.nextPage();
      }
    },
    prevClick: function(e) {
      e.preventDefault();
      if ($(e.currentTarget).hasClass('disabled') === false) {
        return this.prevPage();
      }
    },
    pageClick: function(e) {
      var i;
      e.preventDefault();
      i = $(e.currentTarget).find('a').html();
      if (this.index !== (i - 1)) {
        this.index = i - 1;
        this.checkArrows();
        return this.updatePage();
      }
    },
    nextPage: function() {
      this.index++;
      this.checkArrows();
      return this.updatePage();
    },
    prevPage: function() {
      this.index--;
      this.checkArrows();
      return this.updatePage();
    },
    updatePage: function() {},
    checkArrows: function() {
      $('.pagination li').removeClass('disabled');
      if (this.index === this.pages - 1) {
        this.$nextArrow.addClass('disabled');
      } else {
        this.$nextArrow.removeClass('disabled');
      }
      if (this.index === 0) {
        this.$prevArrow.addClass('disabled');
      } else {
        this.$prevArrow.removeClass('disabled');
      }
      return $("#page-" + (this.index + 1)).parent().addClass('disabled');
    },
    /* GETTER & SETTERS -----------------------------------------------------------------*/

    setPages: function(total_, parent_) {
      var $li, $parent, i, _i, _ref;
      if (parent_ == null) {
        parent_ = null;
      }
      $parent = parent_ ? parent_ : this.$el;
      if (this.$paginationContainer) {
        this.$paginationContainer.remove();
      }
      if (total_ > this.perPage) {
        this.pages = Math.ceil(total_ / this.perPage);
        this.$paginationContainer = $("<div class='center'/>");
        this.$pagination = $("<ul class='pagination'/>");
        this.$prevArrow = $("<li class='prev-arrow'><a href='#'><img src='/static/img/prev-arrow.png'></a></li>");
        this.$nextArrow = $("<li class='next-arrow'><a href='#'><img src='/static/img/next-arrow.png'></a></li>");
        this.$pagination.append(this.$prevArrow);
        for (i = _i = 1, _ref = this.pages; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
          $li = $("<li class='page'><a href='#' id='page-" + i + "'>" + i + "</a></li>");
          this.$pagination.append($li);
        }
        this.$pagination.append(this.$nextArrow);
        this.$paginationContainer.append(this.$pagination);
        $parent.append(this.$paginationContainer);
        this.delegateEvents();
        return this.checkArrows();
      }
    }
  });
});
