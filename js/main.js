(function(global, $) {
    var rules = global.rules = {

    };

    /*
     * A place to prepare our checker
     */
    var init = global.init = function() {
        //$('#test-modal').modal('show');
        
        
        [1, 2, 3, 4, 5, 6, 7].forEach(function(item) {
            $("#weekday-" + item).on('click', function(e) {
                console.log(item);
            })
        });
    };

})(window, jQuery);

window.init();
