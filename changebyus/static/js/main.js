require.config({
    baseUrl: "/static/js",
    paths: {
        "jquery": "ext/jquery/jquery", 
        "underscore": "ext/underscore/underscore-min",
        "backbone": "ext/backbone/backbone-min", 
        "bootstrap": "ext/bootstrap/bootstrap",
        "template": "ext/jquery/template",
        "app":  "views/CBUAppView"
    }
});

require(["jquery","app"], function($, CBUAppView) {
    $(document).ready(function() {
       window.CBUAppView = new CBUAppView({ appendTo: $('body') });
    });
});