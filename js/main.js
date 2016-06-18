(function(global, $) {
    var rules = global.rules = {

    };

    /*
     * Event listeners in modal view
     */

    var initWorktimeModalView = function(worktime) {
        // selectors
        var $st = $('#wtm-startTime');
        var $et = $('#wtm-endTime');
        var $ft = $('#wtm-freeTime');
        var $wt = $('#wtm-workTime');
        var $rt = $('#wtm-releaseTime');
        var $tt = $('#wtm-totalTime');

        var changeResult = function() {
            console.log("Need re calculate");
            var ft = parseInt($ft.val());

            var stm = moment($st.val(), "hh:mm");
            var etm = moment($et.val(), "hh:mm");

            var wtdiff = etm.diff(stm, "minutes");

            // FIXME
            $wt.html(wtdiff/60 + "時" + wtdiff%60 + "分");
            $rt.html(ft + "時");
            var totalTimeInMinutes = wtdiff - ft * 60;
            $tt.html(totalTimeInMinutes/60 + "時" + totalTimeInMinutes%60 + "分");
        };
        $st.val(worktime.startTime).change(function(){
            changeResult();
        });
        $et.val(worktime.endTime).change(function(){
            changeResult();
        });
        $ft.val(worktime.freeTime).change(function(){
            changeResult();
        });

        changeResult();
    };

    $('#test-modal').on('shown.bs.modal', function() {
        var defaultWorktime = {
            'startTime':'08:00',
            'endTime':'17:00',
            'freeTime': '1'
        };

        initWorktimeModalView(defaultWorktime);
    });

    /*
     * A place to prepare our checker
     */
    var init = global.init = function() {
        $('#test-modal').modal('show');
    };

})(window, jQuery);

// window.init();
