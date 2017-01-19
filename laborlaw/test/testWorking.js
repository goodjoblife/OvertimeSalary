var Working = require("../calc").Working;
var moment = require("moment");
var assert = require('chai').assert;

describe('Working', function() {
    it('can contruct', function() {
        var working = new Working();
        assert.isObject(working);
    });

    describe('#clone', function() {
        it('should return new object', function() {
            var working = new Working();

            var workingC = working.clone();
            assert.isObject(workingC);
            assert.notStrictEqual(workingC, working);
            assert.notStrictEqual(workingC.startTime, working.startTime);
        });
        it('property is cloned', function() {
            var working = new Working();

            var workingC = working.clone();
            assert.notStrictEqual(workingC.startTime, working.startTime);
        });
    });

    describe('#divideWorkingTime', function() {
        it('一般工作日', function() {
            var working = new Working();

            working.startTime = moment("2016-06-20 08:00");
            working.endTime   = moment("2016-06-20 17:00");
            working.breakDuration = moment.duration(1, "hours");
            working.isBreak   = false;

            working.divideWorkingTime();

            var normal = working._workingTime.normal,
                extended = working._workingTime.extended;

            assert.equal(normal.normalDay.asHours(), 8);
            assert.equal(extended.normalDay.asHours(), 0);
            assert.equal(normal.nationalHoliday.asHours(), 0);
            assert.equal(extended.dayOff.asHours(), 0);
        });

        it('一般工作日加班', function() {
            var working = new Working();

            working.startTime = moment("2016-06-20 08:00");
            working.endTime   = moment("2016-06-20 20:00");
            working.breakDuration = moment.duration(1, "hours");
            working.isBreak   = false;

            working.divideWorkingTime();

            var normal = working._workingTime.normal,
                extended = working._workingTime.extended;

            assert.equal(normal.normalDay.asHours(), 8);
            assert.equal(extended.normalDay.asHours(), 3);
        });

        it('國定休假日', function() {
            var working = new Working();

            working.startTime = moment("2016-06-20 08:00");
            working.endTime   = moment("2016-06-20 20:00");
            working.breakDuration = moment.duration(1, "hours");
            working.isBreak   = false;

            // this simulate that day is national holiday
            working.calcIsNationalHoliday = function() {
                this.isNationalHoliday = true;
                return this;
            }

            working.divideWorkingTime();

            var normal = working._workingTime.normal,
                extended = working._workingTime.extended;

            assert.equal(normal.nationalHoliday.asHours(), 8);
            assert.equal(extended.dayOff.asHours(), 3);
        });

        it('例假日');
        it('例假日加班');
    });
});
