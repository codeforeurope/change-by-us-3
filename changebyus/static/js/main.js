require(['ext/jquery', 'ext/underscore', 'ext/backbone', 'template', 'projects'], function() {
    $(document).ready(function() {
        window.App = new MyAppName({ appendTo: $('body') });
    });
});