(function(global, $, checker) {
    function workingTime() {
        this.startTime = "08:00";
        this.endTime = "16:00";
        this.freeTime = 1;
    }

    var workingTimes = [];
    for (var i = 0; i < 7; i++) {
        workingTimes.push(new workingTime);
    }

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
    function showModal(data) {
        shared = data;
        $('#test-modal').modal('show');
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

        var workingTime;
        
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
            workingTime.startTime = $st.val();
            workingTime.endTime = $et.val();
            workingTime.freeTime = $ft.val();

            $('#test-modal').modal('hide');
        });

        bindShownEvent(function (data) {
            workingTime = data.workingTime;

            // initial all value
            $st.val(workingTime.startTime);
            $et.val(workingTime.endTime);
            $ft.val(workingTime.freeTime);

            $("#myModalWeekDaySpan").html(["一", "二", "三", "四", "五", "六", "日"][data.weekDay - 1]);

            changeResult();
        });
    }
   
    // init the Table, run once
    function initTable() {
        bindHiddenEvent(function(data) {
            onWorkingTimeUpdated(data.weekDay, data.workingTime);
        });

        [1, 2, 3, 4, 5, 6, 7].forEach(function(weekDay) {
            var me = $("#weekday-" + weekDay);
            var workingTime = workingTimes[weekDay - 1];
            var data = {
                obj: me,
                weekDay: weekDay,
                workingTime: workingTime,
            };

            me.on('click', function () {
                showModal(data);
            });

            onWorkingTimeUpdated(weekDay, workingTime);
        });
    }

    function onWorkingTimeUpdated(weekDay, workingTime) {
        // Update Table
        var me = $("#weekday-" + weekDay);
        me.find(".start").html(workingTime.startTime);
        me.find(".end").html(workingTime.endTime);
        me.find(".break").html(workingTime.freeTime);
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
