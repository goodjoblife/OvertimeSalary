
/*
	This file contains the functions for calculating bonus salary
*/


//FIXME: check whether it is really month salary / 240
function calcHourSalary(monthSalary){
	return monthSalary / 240; 
}

/*
	In this function, we calculate extended working time for one day without 
	considering day-off and changed working hours rules
	
	startTime, endTime are moment object, breakDuration is number (seconds)
	return value: extended time in seconds 
*/
//FIXME: we assume the beginning time and ending time of working are on same day
function calcExtendedTime_OneDay(startTime, endTime, breakDuration){
	if(startTime)
	if(endTime.isBefore(startTime)){
		throw "Time interval error: endTime is before startTime";
	}
	var workingTime = endTime.diff(startTime) - breakDuration;
	var normalTime = moment.duration(8, 'hours');
	var extendedTime = workingTime - normalTime; 
	if(extendedTime < 0) {
		extendedTime = 0; 
	}
	return extendedTime; 
}

/*
	In this function, we calculate extended working time for one week without 
	considering changed working hours rules
	
	startTime, endTime are moment object, breakDuration is number (seconds)
	return value: extended time in seconds 
*/
//FIXME: we assume the beginning time and ending time of working are on same day
function calcExtendedTime_OneWeek(startTimeArr, endTimeArr, breakDurationArr){
	if((startTimeArr.length != endTimeArr.length) || (endTimeArr.length != breakDuration.length)){
		throw "Input Error: length of array are not consistent";
	}
	if(startTimeArr.length != 7){
		throw "Input Error: should be 7 days";
	}
	var nDays = 7;
	for(var i = 0; i < nDays; i++){
		if(endTimeArr[i].isBefore(startTimeArr[i])){
			throw "Time interval error: endTime is before startTime";
		}
	}

	for(var i = 0; i < nDays; i++){

	}

}

function __checkTimeFormat(startTime, endTime, breakDuration)
