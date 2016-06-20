

/*
	This file contains the functions for calculating bonus salary

	Names:
		Routine Day Off: 例假日
		National Holiday: 國定假日
		Special Day Off: 特別休假日
		Bonus: 工資加給 (包含延長工時加給+休假日工作加給)
		DayOffBonus: 休假日工作加給
		ExtendedBonus = 延長工時加給
*/

//rule 30.1 
const normalDayTime = moment.duration(8, 'hours');
const normalWeekTime = moment.duration(40, 'hours');


//FIXME: check whether it is really month salary / 240
function calcHourSalary(monthSalary){
	return monthSalary / 240; 
}


function calcWorkingTime(startTime, endTime, breakDuration){
	if(__checkTimeFormat(startTime, endTime, breakDuration) == false){
		return;
	}
	if(startTime == null && endTime == null){
		return 0;
	}
	var workingTime = endTime.diff(startTime, "hour") - breakDuration;
	return workingTime; 
}

/*
	In this function, we calculate extended working time for one day without 
	considering day-off and changed working hours rules
	
	startTime, endTime are moment object, breakDuration is number (seconds)
	return value: extended time in seconds 
*/
//FIXME: we assume the beginning time and ending time of working are on same day
function calcExtendedTime(startTime, endTime, breakDuration){
	workingTime = calcWorkingTime(startTime, endTime, breakDuration);
	var extendedTime = (workingTime > normalDayTime) ? (workingTime - normalDayTime) : 0 ; 
	return extendedTime; 
}

function calcExtendedTimeByWorkingTime(workingTime){
	var extendedTime = (workingTime > normalDayTime) ? (workingTime - normalDayTime) : 0 ; 
	return extendedTime; 
}

/*
	In this function, we calculate extended working time for one week without 
	considering changed working hours rules
	
	startTime, endTime are moment object, breakDuration is number (seconds)
	return value: an array of extended time for each day (in seconds)  
*/
//FIXME: we assume the beginning time and ending time of working are on same day
function calcExtendedTime_OneWeek(startTimeArr, endTimeArr, breakDurationArr){
	if((startTimeArr.length != endTimeArr.length) || (endTimeArr.length != breakDuration.length)){
		throw "InputError: length of array are not consistent";
	}
	if(startTimeArr.length != 7){
		throw "InputError: should be 7 days";
	}
	__checkConsecutiveDays(beginTimeArr);

	var nDays = 7;
	for(var i = 0; i < nDays; i++){
		if(__checkTimeFormat(startTimeArr[i], endTimeArr[i], breakDurationArr[i]) == false){
			return;
		}
	}

	var workingTimeArr = new Array(7);
	var extendedTimeArr = new Array(7);
	var weekWorkingTime = 0;

	//calculate working time and extended working time for each day
	for(var i = 0; i < nDays; i++){
		var s = startTimeArr[i];
		var e = endTimeArr[i];
		var b = breakDurationArr[i];
		var day = s.day();
		workingTimeArr[i] = calcWorkingTime(startTimeArr[i], endTimeArr[i], breakDurationArr[i]);
		weekWorkingTime += workingTimeArr[i];
		extendedTimeArr[i] = calcExtendedTimeByWorkingTime(workingTimeArr[i]);

	}

	//calculate extended working time for this week 
	weekExtendedTime = (weekWorkingTime > normaWeekTime) ? (weekWorkingTime - normalWeekTime) : 0; 
	distributedExtendedTimeArr = __distributeWeekExtendedTime(weekExtendedTime, workingTimeArr, extendedTimeArr);

	return [extendedTimeArr, distributedExtendedTimeArr];
}

function __distributeWeekExtendedTime(weekExtendedTime, workingTimeArr, extendedTimeArr, dateArray, order=[0, 6, 5, 4, 3, 2, 1]){
	var nDays = 7;
	distributedExtendedTimeArr = new Array(nDays);
	for(var i=0; i< nDays; i++){
		distributedExtendedTimeArr[i] = 0;
	}
	
	if(weekExtendedTime > 0){
		for(var i = 0; i < nDays; i++){
			weekExtendedTime -= extendedTimeArr[i]; 
		}
		if(weekExtendedTime < 0){  //all week extended time are day extended time
			return distributedExtendedTimeArr; 
		}
		else{ //some of week extended time are not day extended time, we need to re-define day extended time
			//generate day to array index mapping
			var mapping = new Array(nDays);
			for(var i=0; i< nDays; i++){
				mapping[dateArr[i].day()] = i;
			}
			//distributing by the given order
			for(var i=0; i < nDays; i++){
				var day = order[i];
				var index = mapping[day];
				if(weekExtendedTime > workingTimeArr[index]){
					weekExtendedTime -= workingTimeArr[index];
					distributedExtendedTimeArr[index] += workingTimeArr[index];
				}
				else{
					distributedExtendedTimeArr[index] += weekExtendedTime;
					weekExtendedTime = 0; 
					break;
				}
			}
			return distributedExtendedTimeArr;
		}
	}
	else{
		return distributedExtendedTimeArr;
	}
	
}

function __checkTimeFormat(startTime, endTime, breakDuration){
	if(startTime == null){
		if(endTime == null){
			return true; 
		}
		else{
			throw "TimeIntervalError: startTime is null but endTime is NOT null";
			return false;
		}
	}
	else{
		if(endTime == null){
			throw "TimeIntervalError: startTime is NOT null but endTime is null";	
			return false;
		}
		else{
			if((startTime instanceof moment) && (endTime instanceof moment) && typeof(breakDuration) == "number"){
				if(endTime.isBefore(startTime)){
					throw "TimeIntervalError: endTime is before startTime";	
					return false;
				}
				else{
					return true;
				}
			}
			else{
				throw "InputTypeError: input type is not correct";
				return false;
			}
		}
	}
}

function __checkConsecutiveDays(beginTimeArr){
	if(beginTimeArr.length <= 0){
		throw "InputError";
	}
	var day = beginTimeArr[i].day();
	for(var i = 1; i < beginTimeArr.length; i++){
		var next = beginTimeArr[i].day();
		if((day+1) % 7 == next){
			day = next;
		}
		else{
			throw "InputError: days are not consecutive";
			return false;
		}
	}
	return true;
}

function calcDayOffBonus(hourSalary){
	return hourSalary * normalDayTime.hours();
}

function calcExtendedTimeBonus(extendedTime, distributedExtendedTime, hourSalary, firstAdd=(4.0/3.0), secondAdd=(5.0/3.0), moreAdd=(5.0/3.0)){
	
	var now = 0;
	var bonus = 0;
	if(distributedExtendedTime == 0){
		var remain = extendedTime;

		//first 2 hours
		now = (remain >= 2) ? 2 : remain; 
		bonus += now * firstAdd * hourSalary; 
		remain = (remain >= 2) ? remain -2 : 0;
			
		//later 2 hours
		now = (remain >= 2) ? 2 : remain;
		bonus += now * secondAdd * hourSalary; 
		remain = (remain >= 2) ? remain -2 : 0;

		//more 
		bonus += remain * moreAdd * hourSalary; 
		return bonus;
	}
	else{
		var remain = distributedExtendedTime;
		
		//first 2 hours
		now = (remain >= 2) ? 2 : remain; 
		bonus += now * (firstAdd-1) * hourSalary; 
		remain = (remain >= 2) ? remain -2 : 0;
			
		//later 2 hours
		now = (remain >= 2) ? 2 : remain;
		bonus += now * (secondAdd-1) * hourSalary; 
		remain = (remain >= 2) ? remain -2 : 0;

		//more
		bonus += remain * (moreAdd-1) * hourSalary;

		bonus += extendedTime * moreAdd * hourSalary; 
	}		
}

//FIXME
function isNationalHoliday(date){
	return false;
}

//	routineDayOffDay defaults to Sunday
function calcBonus_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary, routineDayOffDay=0){
	var nDays = 7;
	[extendedTimeArr, distributedExtendedTimeArr] = calcExtendedTime_OneWeek(startTimeArr, endTimeArr, breakDurationArr);

	var bonus = 0;
	for(var i = 0; i < nDays; i++){
		var day = startTimeArr[i].day();
		var t1 = extendedTimeArr[i];
		var t2 = distributedExtendedTimeArr[i];
		bonus += calcExtendedTimeBonus(t1, t2, hourSalary);
		if(t1 > 0 || t2 > 0){
			bonus += calcDayOffBonus(hourSalary);
		}
	}
	return bonus;
}

