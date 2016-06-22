var calc = require("./calc.js");
var moment = require("moment");

var hourSalary = 100;

//test case 1: overtimeSalary = 0
startTimeArr = [
	moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
	moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
	null, null
];
endTimeArr = [
	moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
	moment("2016-06-23 17:00"), moment("2016-06-24 17:00"),
	null, null
];
breakDurationArr = [
	moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
	moment.duration(1, "hour"), moment.duration(1, "hour"),
	null, null
];

s = calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary);
console.log("Expected: 0\tActual:", s);


//test case 2: overtimeSalary = 2*100*(1/3) + 6*100*(2/3) = 466   (over 40 hours)
startTimeArr = [
	moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
	moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
	moment("2016-06-25 08:00"), null
];
endTimeArr = [
	moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
	moment("2016-06-23 17:00"), moment("2016-06-24 17:00"),
	moment("2016-06-25 17:00"), null
];
breakDurationArr = [
	moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
	moment.duration(1, "hour"), moment.duration(1, "hour"),
	moment.duration(1, "hour"), null
];

s = calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary);
console.log("Expected: 466\tActual:", s);

//test case 3: overtimeSalary = 2*100*(1/3) + 6*100*(2/3) + 2*100*(5/3) = 800  (over 40 hrs, and over 8 hrs on rest day)
startTimeArr = [
	moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
	moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
	moment("2016-06-25 08:00"), null
];
endTimeArr = [
	moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
	moment("2016-06-23 17:00"), moment("2016-06-24 17:00"),
	moment("2016-06-25 19:00"), null
];
breakDurationArr = [
	moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
	moment.duration(1, "hour"), moment.duration(1, "hour"),
	moment.duration(1, "hour"), null
];

s = calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary);
console.log("Expected: 800\tActual:", s);


//test case 4: overTimeSalary = 0 (not over 40hrs per week, 8hrs per day)
startTimeArr = [
	moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
	moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
	moment("2016-06-25 08:00"), null
];
endTimeArr = [
	moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
	moment("2016-06-23 13:00"), moment("2016-06-24 13:00"),
	moment("2016-06-25 17:00"), null
];
breakDurationArr = [
	moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
	moment.duration(1, "hour"), moment.duration(1, "hour"),
	moment.duration(1, "hour"), null
];

s = calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary);
console.log("Expected: 0\tActual:", s);

//test case 5: overTimeSalary = 8*100 = 800 (working on routine day off, if less than 8 hrs, still give 8hrs)
startTimeArr = [
	moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
	moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
	null, moment("2016-06-26 08:00")
];
endTimeArr = [
	moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
	moment("2016-06-23 17:00"), moment("2016-06-24 17:00"),
	null, moment("2016-06-26 12:00")
];
breakDurationArr = [
	moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
	moment.duration(1, "hour"), moment.duration(1, "hour"),
	null, moment(0, "hour")
];

s = calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary);
console.log("Expected: 800\tActual:", s);


//test case 6: overTimeSalary = 8*100 + 2*(4/3)*100 = 1066 (working on routine day off and more than 8hrs)
startTimeArr = [
	moment("2016-06-20 08:00"), moment("2016-06-21 08:00"), moment("2016-06-22 08:00"),
	moment("2016-06-23 08:00"), moment("2016-06-24 08:00"),
	null, moment("2016-06-26 08:00")
];
endTimeArr = [
	moment("2016-06-20 17:00"), moment("2016-06-21 17:00"), moment("2016-06-22 17:00"),
	moment("2016-06-23 17:00"), moment("2016-06-24 17:00"),
	null, moment("2016-06-26 19:00")
];
breakDurationArr = [
	moment.duration(1, "hour"), moment.duration(1, "hour"), moment.duration(1, "hour"), 
	moment.duration(1, "hour"), moment.duration(1, "hour"),
	null, moment.duration(1, "hour")
];

s = calc.calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary);
console.log("Expected: 1066\tActual:", s);