(function(exports, $, moment, calc) {
    var workingTimes = exports.workingTimes = [];
    exports.monthSalary = 0;

    for (var i = 0; i < 7; i++) {
        work = new calc.Working();
        work.startTime = moment().weekday(i - 7).hour(8).minute(0).second(0).millisecond(0);
        work.endTime   = moment().weekday(i - 7).hour(17).minute(0).second(0).millisecond(0);
        work.freeTime  = moment.duration(1, "hours");
        work.isBreak   = false;
        work.isRoutineDayOff = false;

        workingTimes.push(work);
    }
    workingTimes[0].isRoutineDayOff = true;

    var callbacks = {};
    exports.on = function(type, callback) {
        if (!(type in callbacks)) {
            callbacks[type] = [];
        }
        callbacks[type].push(callback);
    }
    exports.emit = function(type, data) {
        if (!(type in callbacks)) {
            return;
        }
        callbacks[type].forEach(function(callback) {
            callback.call(exports, data);
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
        var $ib = $('#wtm-isBreak');
        var $irdo = $('#wtm-isRoutineDayOff');
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

        function formToData() {
            var data = {
                freeTime        : moment.duration(parseInt($ft.val()), "minutes"),
                startTime       : moment($st.val(), "HH:mm"),
                endTime         : moment($et.val(), "HH:mm"),
                isBreak         : ($ib.prop("checked") === true),
                isRoutineDayOff : ($irdo.prop("checked") === true),
            }
            return data;
        }

        function changeResult() {
            console.log("Need re calculate");
            
            var workingTime = formToData();
            var workingTimeDuration = moment.duration(workingTime.endTime -workingTime.startTime);
            var totalTimeDuration   = moment.duration(workingTimeDuration - workingTime.freeTime);

            if (workingTime.isBreak) {
                $wt.html((0).toHM());
                $rt.html((0).toHM());
                $tt.html((0).toHM());

                $st.prop("disabled", true);
                $et.prop("disabled", true);
                $ft.prop("disabled", true);
            } else {
                $wt.html(workingTimeDuration.asMinutes().toHM());
                $rt.html(workingTime.freeTime.asMinutes().toHM());
                $tt.html(totalTimeDuration.asMinutes().toHM());

                $st.prop("disabled", false);
                $et.prop("disabled", false);
                $ft.prop("disabled", false);
            }
        };

        $("#test-modal-button").on('click', function () {
            var workingTime = workingTimes[weekDay];

            workingTimes[weekDay] = formToData();

            $('#test-modal').modal('hide');

            exports.emit("WorkingTimeChanged", weekDay);
            exports.emit("WorkingTimesChanged");
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
                $ft.val(workingTime.freeTime.asMinutes());
                $ib.prop("checked", false);
            }
            $irdo.prop("checked", workingTime.isRoutineDayOff);

            $("#myModalWeekDaySpan").html(["日", "一", "二", "三", "四", "五", "六"][weekDay]);

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

            drawWorkingTime(weekDay);
        });
    }

    exports.on("WorkingTimeChanged", function(weekDay) {
        drawWorkingTime(weekDay);
    });

    function drawWorkingTime(weekDay) {
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
            me.find(".break").html(workingTime.freeTime.asMinutes());
        }
        if (workingTime.isRoutineDayOff) {
            me.css("background-color", "#FF3333");
        } else {
            me.css("background-color", "");
        }
    }

    /*
     * A place to prepare our checker
     */
    var init = exports.init = function(callback) {
        initTable();
        initModal();

        $("#month-salary").change(function () {
            exports.monthSalary = parseInt($("#month-salary").val());

            exports.emit("MonthSalaryChanged");
        });
        exports.monthSalary = parseInt($("#month-salary").val());

        callback && callback();
    };

})(window.workingTimesForm = window.workingTimesForm || {}, jQuery, moment, window.calc);

window.workingTimesForm.init(function () {
    $("#weekday-1").click();

    workingTimesForm.on("WorkingTimesChanged", function() {
        update();
    });

    workingTimesForm.on("MonthSalaryChanged", function() {
        update();
    });

    update();

    function update() {
        var workingTimes = window.workingTimesForm.workingTimes;
        var monthSalary = window.workingTimesForm.monthSalary;
        var hourSalary = monthSalary / 240;

        $.each(workingTimes, function(i, workingTime) {
            var weekDay = i + 1;
            $("#weekday-" + weekDay).find(".workingTime").text(
                calc.calcWorkingTime(workingTime.startTime, workingTime.endTime, workingTime.freeTime).asHours()
            );
        });

        /*
         * Adapter for our calc lib
         */
        var startTimeArr = [], endTimeArr = [], breakDurationArr = [];

        $.each(workingTimes, function(i, workingTime) {
            if (workingTime.isBreak) {
                startTimeArr.push(null);
                endTimeArr.push(null);
                breakDurationArr.push(null);
            } else {
                startTimeArr.push(workingTime.startTime);
                endTimeArr.push(workingTime.endTime);
                breakDurationArr.push(workingTime.freeTime);
            }
        });

        // main part
        var overtimeSalary = calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary);
        console.log(overtimeSalary);
    }
});
