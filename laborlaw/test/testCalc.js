var calc = require("../calc");
var moment = require("moment");
var assert = require('chai').assert;

describe('calcOvertimeSalary_OneWeek', function() {

    it('沒有任何加班', function() {
        var hourSalary = 100;

        var startTimeArr = [
            moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
            moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
            null, null
        ], endTimeArr = [
            moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
            moment("2016-06-23 17:00"), moment("2016-06-24 17:00"),
            null, null
        ], breakDurationArr = [
            moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
            moment.duration(1, "hour"), moment.duration(1, "hour"),
            null, null
        ];

        assert.equal(
            calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary),
            0
        );
    });

    //test case 2: overtimeSalary = 2*120*(1/3) + 6*120*(2/3) = 560   (over 40 hours)
    it('星期六加班，非1.33倍', function() {
        var hourSalary = 120;

        var startTimeArr = [
            moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
            moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
            moment("2016-06-25 08:00"), null
        ], endTimeArr = [
            moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
            moment("2016-06-23 17:00"), moment("2016-06-24 17:00"),
            moment("2016-06-25 17:00"), null
        ], breakDurationArr = [
            moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
            moment.duration(1, "hour"), moment.duration(1, "hour"),
            moment.duration(1, "hour"), null
        ];

        assert.equal(
            calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary),
            560
        );
    });

    //test case 3: overtimeSalary = 2*100*(1/3) + 6*100*(2/3) + 2*100*(5/3) = 800  (over 40 hrs, and over 8 hrs on rest day)
    it('星期六加班超過8小時', function() {
        var hourSalary = 100;

        var startTimeArr = [
            moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
            moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
            moment("2016-06-25 08:00"), null
        ], endTimeArr = [
            moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
            moment("2016-06-23 17:00"), moment("2016-06-24 17:00"),
            moment("2016-06-25 19:00"), null
        ], breakDurationArr = [
            moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
            moment.duration(1, "hour"), moment.duration(1, "hour"),
            moment.duration(1, "hour"), null
        ];

        assert.equal(
            calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary),
            800
        );
    });

    //test case 4: overTimeSalary = 0 (not over 40hrs per week, 8hrs per day)
    it('每日8小時內，單週40小時內', function() {
        var hourSalary = 100;

        var startTimeArr = [
            moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
            moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
            moment("2016-06-25 08:00"), null
        ], endTimeArr = [
            moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
            moment("2016-06-23 13:00"), moment("2016-06-24 13:00"),
            moment("2016-06-25 17:00"), null
        ], breakDurationArr = [
            moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
            moment.duration(1, "hour"), moment.duration(1, "hour"),
            moment.duration(1, "hour"), null
        ];

        assert.equal(
            calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary),
            0
        );
    });

    //test case 5: overTimeSalary = 8*100 = 800 (working on routine day off, if less than 8 hrs, still give 8hrs)
    it('', function() {
        var hourSalary = 100;

        var startTimeArr = [
            moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
            moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
            null, moment("2016-06-26 08:00")
        ], endTimeArr = [
            moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
            moment("2016-06-23 17:00"), moment("2016-06-24 17:00"),
            null, moment("2016-06-26 12:00")
        ], breakDurationArr = [
            moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
            moment.duration(1, "hour"), moment.duration(1, "hour"),
            null, moment.duration(0, "hour")
        ];

        assert.equal(
            calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary),
            800
        );
    });

    //test case 6: overTimeSalary = 8*120 + 2*(4/3)*120 = 1280 (working on routine day off and more than 8hrs)
    it('', function() {
        var hourSalary = 120;

        var startTimeArr = [
            moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
            moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
            null, moment("2016-06-26 08:00")
        ], endTimeArr = [
            moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
            moment("2016-06-23 17:00"), moment("2016-06-24 17:00"),
            null, moment("2016-06-26 19:00")
        ], breakDurationArr = [
            moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
            moment.duration(1, "hour"), moment.duration(1, "hour"),
            null, moment.duration(1, "hour")
        ];

        assert.equal(
            calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary),
            1280
        );
    });
});
