(function(global, $) {
    var rules = global.rules = {

    };

    // sharing the data with modal and table
    // make sure the event is bind via bindShownEvent, bindHiddenEvent
    var shared = undefined;
    function bindShownEvent(shown) {
        $('#test-modal').on('shown.bs.modal', function () {
            var data = shared;
            shown(data);
        });
    }
    function bindHiddenEvent(hidden) {
        $('#test-modal').on('hidden.bs.modal', function () {
            var data = shared;
            hidden(data);
        });
    }

    Number.prototype.toHM = function() {
        return Math.floor(this/60) + "時" + this%60 + "分";
    }

    // init the Modal, run once
    function initModal() {
        var $st = $('#wtm-startTime');
        var $et = $('#wtm-endTime');
        var $ft = $('#wtm-freeTime');
        var $wt = $('#wtm-workTime');
        var $rt = $('#wtm-releaseTime');
        var $tt = $('#wtm-totalTime');

        $st.change(function () {
            changeResult();
        });
        $et.change(function () {
            changeResult();
        });
        $ft.change(function () {
            changeResult();
        });
        
        function changeResult() {
            console.log("Need re calculate");
            var ft = parseInt($ft.val());
            var stm = moment($st.val(), "hh:mm");
            var etm = moment($et.val(), "hh:mm");
            var wtdiff = etm.diff(stm, "minutes");

            // FIXME
            $wt.html(wtdiff.toHM());
            $rt.html(ft + "時");
            var totalTimeInMinutes = wtdiff - ft * 60;
            $tt.html(totalTimeInMinutes.toHM());
        };

        $("#test-modal-button").on('click', function () {
            $('#test-modal').modal('hide');
        });

        bindShownEvent(function (data) {
            var worktime = data;

            // initial all value
            $st.val(worktime.startTime);
            $et.val(worktime.endTime);
            $ft.val(worktime.freeTime);

            changeResult();
        });
    }
   
    // init the Table, run once
    function initTable() {
        bindHiddenEvent(function(data) {
            data.obj.trigger('view.update');
        });

        [1, 2, 3, 4, 5, 6, 7].forEach(function(weekDay) {
            var me = $("#weekday-" + weekDay);
            var data = {
                obj: me,
                weekDay: weekDay,
                startTime: '08:10',
                endTime: '17:30',
                freeTime: '1',
            };

            me.on('click', function () {
                // update the shared data
                shared = data;
                $('#test-modal').modal('show');
            });
        
            me.on('view.update', function() {
                me.find(".start").html(data.startTime);
                me.find(".end").text(data.endTime);
                me.find(".break").text(data.freeTime);
            });

            me.trigger('view.update');
        });
    }

    /*
     * A place to prepare our checker
     */
    var init = global.init = function(callback) {
        initTable();
        initModal();

        callback && callback();
    };

})(window, jQuery);

window.init(function () {
    $("#weekday-1").click();
});
