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
                freeTime: '1:00',
            };

            workTimes.push(data);

            me.on('click', function(e) {
                $('#test-modal').modal('show', weekDay);
            });
        
            me.on('gj.changed', function() {
                me.find(".start").html(data.startTime);
                me.find(".end").text(data.endTime);
                me.find(".break").text(data.freeTime);
            });

            me.trigger('gj.changed');
        });

        $('#test-modal').on('hidden.bs.modal', function (event) {
            var data = event.relatedTarget;

            console.log(data);

            data.obj.trigger('gj.changed');
        });
    };

})(window, jQuery);

window.init();
