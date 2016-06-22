var Working = require("../calc").Working;
var moment = require("moment");
var assert = require('chai').assert;

describe('class Working', function() {
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
});

