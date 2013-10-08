var app;

app = window.app || {};

app.utils = (function() {
  return {
    formatDate: function(dateString_) {
      var d;
      return d = new Date(dateString_);
    }
  };
})();
