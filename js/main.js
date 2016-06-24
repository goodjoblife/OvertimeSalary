(function(exports, $, moment, calc) {
    var workingsArr = exports.workingsArr = [];

    exports.monthSalary = 0;

    function initData() {
        for (var i = 0; i < 7; i++) {
            working = new calc.Working();
            working.startTime       = moment().weekday(i - 7).hour(8).minute(0).second(0).millisecond(0);
            working.endTime         = moment().weekday(i - 7).hour(17).minute(0).second(0).millisecond(0);
            working.breakDuration   = moment.duration(1, "hours");
            working.isBreak         = false;
            working.isRoutineDayOff = false;

            workingsArr.push(working);
        }
        workingsArr[0].isRoutineDayOff = true;
        workingsArr[0].isBreak = true;
    }

    (function() {
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
    })();

    Number.prototype.toHM = function() {
        return Math.floor(this/60) + "時" + this%60 + "分";
    }

    // init the Modal, run once
    function initModal() {
        var $st = $('#wtm-startTime');
        var $et = $('#wtm-endTime');
        var $bd = $('#wtm-breakDuration');
        var $ib = $('#wtm-isBreak');
        var $irdo = $('#wtm-isRoutineDayOff');
        var $wt = $('#wtm-workTime');
        var $rt = $('#wtm-releaseTime');
        var $tt = $('#wtm-totalTime');

        var pointer = null;

        $st.change(function () {
            changeResult();
        });
        $et.change(function () {
            changeResult();
        });
        $bd.change(function () {
            changeResult();
        });
        $ib.change(function() {
            changeResult();
        });

        function formToWork(work) {
            work.breakDuration   = moment.duration(parseInt($bd.val()), "minutes");
            work.startTime.hour($st.val().split(":")[0]).minute($st.val().split(":")[1]);
            work.endTime.hour($et.val().split(":")[0]).minute($et.val().split(":")[1]);
            work.isBreak         = ($ib.prop("checked") === true);
            work.isRoutineDayOff = ($irdo.prop("checked") === true);

            return work;
        }

        function changeResult() {
            var work = workingsArr[pointer].clone();
            formToWork(work);
            var workingTimeDuration = moment.duration(work.endTime - work.startTime);
            var totalTimeDuration   = moment.duration(workingTimeDuration - work.breakDuration);

            if (work.isBreak) {
                $wt.html((0).toHM());
                $rt.html((0).toHM());
                $tt.html((0).toHM());

                $st.prop("disabled", true);
                $et.prop("disabled", true);
                $bd.prop("disabled", true);
            } else {
                $wt.html(workingTimeDuration.asMinutes().toHM());
                $rt.html(work.breakDuration.asMinutes().toHM());
                $tt.html(totalTimeDuration.asMinutes().toHM());

                $st.prop("disabled", false);
                $et.prop("disabled", false);
                $bd.prop("disabled", false);
            }
        };

        $("#test-modal-button").on('click', function () {
            var work = workingsArr[pointer];

            formToWork(work);

            $('#test-modal').modal('hide');

            exports.emit("WorkingTimeChanged", pointer);
            exports.emit("WorkingTimesChanged");
        });

        $('#test-modal').on('show.bs.modal', function (event) {
            pointer = event.relatedTarget;
            var working = workingsArr[pointer];

            if (working.isBreak) {
                $st.val("");
                $et.val("");
                $bd.val("");
                $ib.prop("checked", true);
            } else {
                // initial all value
                $st.val(working.startTime.format("HH:mm"));
                $et.val(working.endTime.format("HH:mm"));
                $bd.val(working.breakDuration.asMinutes());
                $ib.prop("checked", false);
            }
            $irdo.prop("checked", working.isRoutineDayOff);

            $("#myModalWeekDaySpan").html(["日", "一", "二", "三", "四", "五", "六"][pointer]);

            changeResult();
        });
    }
   
    // init the Table, run once
    var $wct = $("#workingCollectionTable");
    function initTable() {
        workingsArr.forEach(function (working, i) {
            var html = 
                "<div class=\"row oneday\" id=\"weekday-" + i + "\">" + 
                "<div class=\"col-md-12 week\">" +  ["日", "一", "二", "三", "四", "五", "六"][i] + "</div>" + 
                "<div class=\"col-md-12 start\"></div>" +
                "<div class=\"col-md-12 end\"></div>" +
                "<div class=\"col-md-12 break\"></div>" +
                "<div class=\"col-md-12 workingTime\"></div>" +
                "</div>";
            $(html)
                .appendTo($wct)
                .on('click', function () {
                    $('#test-modal').modal('show', i);
                });
            
            drawWorkingTime(i);
        });

        exports.on("WorkingTimeChanged", function(i) {
            drawWorkingTime(i);
        });
    }


    function drawWorkingTime(i) {
        var working = workingsArr[i];

        // Update Table
        var me = $("#weekday-" + i);

        if (working.isBreak) {
            me.find(".start").html("");
            me.find(".end").html("");
            me.find(".break").html("");
        } else {
            me.find(".start").html(working.startTime.format("HH:mm"));
            me.find(".end").html(working.endTime.format("HH:mm"));
            me.find(".break").html(working.breakDuration.asMinutes());
        }
        if (working.isRoutineDayOff) {
            me.css("background-color", "#FF3333");
        } else {
            me.css("background-color", "");
        }
    }

    /*
     * A place to prepare our checker
     */
    var init = exports.init = function(callback) {
        initData();
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
    workingTimesForm.on("WorkingTimesChanged", function() {
        update();
    });

    workingTimesForm.on("MonthSalaryChanged", function() {
        update();
    });

    update();

    function update() {
        var workingsArr = window.workingTimesForm.workingsArr;
        var monthSalary = window.workingTimesForm.monthSalary;
        var hourSalary = monthSalary / 240;

        $.each(workingsArr, function(i, working) {
            $("#weekday-" + i).find(".workingTime").text(
                working.isBreak ? 0 : calc.calcWorkingTime(working.startTime, working.endTime, working.breakDuration).asHours()
            );
        });

        /*
         * Adapter for our calc lib
         */
        var startTimeArr = [], endTimeArr = [], breakDurationArr = [];

        $.each(workingsArr, function(i, working) {
            if (working.isBreak) {
                startTimeArr.push(null);
                endTimeArr.push(null);
                breakDurationArr.push(null);
            } else {
                startTimeArr.push(working.startTime);
                endTimeArr.push(working.endTime);
                breakDurationArr.push(working.freeTime);
            }
        });

        // main part
        var overtimeSalary = calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary);
        console.log(overtimeSalary);
    }

    $("#weekday-1").click();
});
