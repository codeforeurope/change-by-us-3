define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
  var AbstractView;
  return AbstractView = Backbone.View.extend({
    parent: "body",
    templateDir: "/static",
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
    onTemplateLoad: function() {
      this.trigger('ON_TEMPLATE_LOAD');
      this.templateLoaded = true;
      if (this.delayedCollectionLoad) {
        this.loadData();
      }
      return this.delegateEvents();
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
    setPages: function(total, parent_) {
      var $li, $parent, i, _i, _ref,
        _this = this;
      if (parent_ == null) {
        parent_ = null;
      }
      $parent = parent_ ? parent_ : this.$el;
      if (this.$paginationContainer) {
        this.$paginationContainer.remove();
      }
      if (total > this.perPage) {
        this.pages = Math.ceil(total / this.perPage);
        this.$paginationContainer = $("<div class='center'/>");
        this.$pagination = $("<ul class='pagination'/>");
        this.$prevArrow = $("<li class='prev-arrow'><a href='#'><img src='/static/img/prev-arrow.png'></a></li>");
        this.$nextArrow = $("<li class='next-arrow'><a href='#'><img src='/static/img/next-arrow.png'></a></li>");
        this.$prevArrow.click(function(e) {
          if ($(e.currentTarget).hasClass('disabled') === false) {
            _this.prevPage();
          }
          return false;
        });
        this.$nextArrow.click(function(e) {
          if ($(e.currentTarget).hasClass('disabled') === false) {
            _this.nextPage();
          }
          return false;
        });
        this.$pagination.append(this.$prevArrow);
        for (i = _i = 1, _ref = this.pages; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
          $li = $("<li class='page'><a href='#' id='page-" + i + "'>" + i + "</a></li>");
          $li.click(function(e) {
            i = $(e.currentTarget).find('a').html();
            _this.pageClick(i);
            return false;
          });
          this.$pagination.append($li);
        }
        this.$pagination.append(this.$nextArrow);
        this.$paginationContainer.append(this.$pagination);
        $parent.append(this.$paginationContainer);
        return this.checkArrows();
      }
    },
    nextPage: function() {
      this.index++;
      this.checkArrows();
      return this.updatePage();
    },
    prevPage: function(e) {
      this.index--;
      this.checkArrows();
      return this.updatePage();
    },
    updatePage: function() {},
    pageClick: function(i) {
      if (this.index !== (i - 1)) {
        this.index = i - 1;
        this.checkArrows();
        return this.updatePage();
      }
    },
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
    }
  });
});
