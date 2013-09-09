require.config({
  baseUrl: "/static/js",
  paths: {
    "backbone": "ext/backbone/backbone", 
    "bootstrap": "ext/bootstrap/bootstrap",
    "jquery": "ext/jquery/jquery", 
    "underscore": "ext/underscore/underscore",
    "template": "ext/jquery/template"
  }
});

require(['jquery', 'views/CBUAppView'], function() {
   $(document).ready(function() {
       window.App = new CBUApp({ appendTo: $('body') });
    });
});