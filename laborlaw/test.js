var calc = require("./calc.js");
var moment = require("moment");

startTimeArr = [
	moment("2016-06-20 08:00"),
	moment("2016-06-21 08:00"),
	moment("2016-06-22 08:00"),
	moment("2016-06-23 08:00"),
	moment("2016-06-24 08:00"),
	moment("2016-06-25 08:00"),
	null
];
endTimeArr = [
	moment("2016-06-20 17:00"),
	moment("2016-06-21 17:00"),
	moment("2016-06-22 17:00"),
	moment("2016-06-23 17:00"),
	moment("2016-06-24 17:00"),
	moment("2016-06-25 19:00"),
	null
];
breakDurationArr = [
	moment.duration(1, "hour"), 
	moment.duration(1, "hour"), 
	moment.duration(1, "hour"), 
	moment.duration(1, "hour"), 
	moment.duration(1, "hour"),
	moment.duration(1, "hour"),
	null
];

s = calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, 100);
console.log(s);