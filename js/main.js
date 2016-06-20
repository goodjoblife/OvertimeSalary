(function(global, $, moment, checker) {
    function workingTime() {
        this.startTime = moment('08:00', 'HH:mm');
        this.endTime = moment('17:00', 'HH:mm');
        this.freeTime = 1;
        this.isBreak = false;
    }

    var workingTimes = [];
    for (var i = 0; i < 7; i++) {
        workingTimes.push(new workingTime);
    }

    Number.prototype.toHM = function() {
        return Math.floor(this/60) + "時" + this%60 + "分";
    }

    // init the Modal, run once
    function initModal() {
        var $st = $('#wtm-startTime');
        var $et = $('#wtm-endTime');
        var $ft = $('#wtm-freeTime');
        var $ib = $('#wtm-isBreak');
        var $wt = $('#wtm-workTime');
        var $rt = $('#wtm-releaseTime');
        var $tt = $('#wtm-totalTime');

        var weekDay = null;

        $st.change(function () {
            changeResult();
        });
        $et.change(function () {
            changeResult();
        });
        $ft.change(function () {
            changeResult();
        });

        $ib.change(function() {
            changeResult();
        });

        function changeResult() {
            console.log("Need re calculate");
            var ft = parseInt($ft.val());
            var stm = moment($st.val(), "HH:mm");
            var etm = moment($et.val(), "HH:mm");
            var wtdiff = etm.diff(stm, "minutes");
            var isBreak = $ib.prop("checked") === true;

            if (isBreak) {
                $wt.html((0).toHM());
                $rt.html("0時");
                $tt.html((0).toHM());

                $st.prop("disabled", true);
                $et.prop("disabled", true);
                $ft.prop("disabled", true);
            } else {
                // FIXME
                $wt.html(wtdiff.toHM());
                $rt.html(ft + "時");
                var totalTimeInMinutes = wtdiff - ft * 60;
                $tt.html(totalTimeInMinutes.toHM());

                $st.prop("disabled", false);
                $et.prop("disabled", false);
                $ft.prop("disabled", false);
            }
        };

        $("#test-modal-button").on('click', function () {
            var workingTime = workingTimes[weekDay];

            if ($ib.prop("checked")) {
                workingTime.isBreak = true;
            } else {
                workingTime.startTime = moment($st.val(), "HH:mm");
                workingTime.endTime = moment($et.val(), "HH:mm");
                workingTime.freeTime = parseInt($ft.val());
                workingTime.isBreak = false;
            }

            $('#test-modal').modal('hide');
            onWorkingTimeUpdated(weekDay);
        });

        $('#test-modal').on('show.bs.modal', function (event) {
            weekDay = event.relatedTarget;
            var workingTime = workingTimes[weekDay];

            if (workingTime.isBreak) {
                $st.val("");
                $et.val("");
                $ft.val("");
                $ib.prop("checked", true);
            } else {
                // initial all value
                $st.val(workingTime.startTime.format("HH:mm"));
                $et.val(workingTime.endTime.format("HH:mm"));
                $ft.val(workingTime.freeTime);
                $ib.prop("checked", false);
            }

            $("#myModalWeekDaySpan").html(["一", "二", "三", "四", "五", "六", "日"][weekDay]);

            changeResult();
        });
    }
   
    // init the Table, run once
    function initTable() {
        [1, 2, 3, 4, 5, 6, 7].forEach(function(item) {
            var weekDay = item - 1;
            var workingTime = workingTimes[weekDay];

            $("#weekday-" + item).on('click', function () {
                $('#test-modal').modal('show', weekDay);
            });

            onWorkingTimeUpdated(weekDay);
        });
    }

    function onWorkingTimeUpdated(weekDay) {
        var workingTime = workingTimes[weekDay];

        // Update Table
        var me = $("#weekday-" + (weekDay + 1));

        if (workingTime.isBreak) {
            me.find(".start").html("");
            me.find(".end").html("");
            me.find(".break").html("");
        } else {
            me.find(".start").html(workingTime.startTime.format("HH:mm"));
            me.find(".end").html(workingTime.endTime.format("HH:mm"));
            me.find(".break").html(workingTime.freeTime);
        }
    }

    /*
     * A place to prepare our checker
     */
    var init = global.init = function(callback) {
        initTable();
        initModal();

        callback && callback();
    };

})(window, jQuery, moment);

window.init(function () {
    $("#weekday-1").click();
});
