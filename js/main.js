(function(global, $) {
    var rules = global.rules = {

    };

    /*
     * Event listeners in modal view
     */

    Number.prototype.toHM = function () {
        return Math.floor(this/60) + "時" + this%60 + "分";
    }

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
            $wt.html(Math.floor(wtdiff/60) + "時" + wtdiff%60 + "分");
            $rt.html(ft + "時");
            var totalTimeInMinutes = wtdiff - ft * 60;
            //$tt.html(Math.floor(totalTimeInMinutes/60) + "時" + totalTimeInMinutes%60 + "分");
            $tt.html(totalTimeInMinutes.toHM());
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

    $('#test-modal').on('shown.bs.modal', function(event) {
        var data = event.relatedTarget;

        console.log(data);

        initWorktimeModalView(data);
        
        $("#test-modal-button").on('click', function () {
            $("#test-modal-button").off('click');
            
            $('#test-modal').on('hidden.bs.modal', function (event) {
                $('#test-modal').off('hidden.bs.modal');

                data.obj.trigger('gj.changed');
            });

            $('#test-modal').modal('hide');
        });
        
    });

    var workTimes = [];
    /*
     * A place to prepare our checker
     */
    var init = global.init = function() {

        [1, 2, 3, 4, 5, 6, 7].forEach(function(weekDay) {
            var me = $("#weekday-" + weekDay);
            var data = {
                obj: me,
                weekDay: weekDay,
                startTime: '08:10',
                endTime: '17:30',
                freeTime: '1',
            };

            workTimes.push(data);

            me.on('click', function(e) {
                $('#test-modal').modal('show', data);
            });
        
            me.on('gj.changed', function() {
                console.log("gj.changed");

                me.find(".start").html(data.startTime);
                me.find(".end").text(data.endTime);
                me.find(".break").text(data.freeTime);
            });

            me.trigger('gj.changed');
        });

        $("#weekday-1").click();

    };

})(window, jQuery);

window.init();
