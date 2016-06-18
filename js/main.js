(function(global, $) {
    var rules = global.rules = {

    };

    /*
     * Event listeners in modal view
     */

    var initWorktimeModalView = function(worktime) {
        console.log("Init modal view");
        console.log(worktime);
    };

    $('#test-modal').on('shown.bs.modal', function() {
        var defaultWorktime = {
            'startTime':'08:00:00',
            'endTime':'17:00:00',
            'freeTime': '1'
        };

        initWorktimeModalView(defaultWorktime);
    });

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
