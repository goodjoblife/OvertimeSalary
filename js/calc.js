(function() {
var e, m;
if (typeof module !== 'undefined') {
    e = module.exports;
    m = require('moment');
} else {
    window.calc = window.calc || {};
    e = window.calc;
    m = moment;
}
(function (exports, moment) {
/*

Definition of names:
工時(WorkingTime):
	->正常工時(NormalWorkingTime, nwt):
		->非休假日: 平日每小時工資
		->休假日(NormalWorkingTimeOnNormalDay, nwtNormal): 
			->例假日(NormalWorkingTimeOnRoutineDayOff, nwtRoutineOff): 外加8小時薪資，需補休  //TODO
			->國定休假日: 
				->輪班人員 & 調移至其他日休假: 平日每小時工資(暫不考慮)
				->否則(NormalWorkingTimeOnNationalHoliday, nwtHoliday): 外加8小時薪資，不需補休。  //TODO
			->特休日: 暫不考慮
	->延長工時(ExtendedWorkingTime, ewt)
		->超過每日8小時: 
			->休假日(ExtendedWorkingTimeOnDayOff, ewtDayOff): 1.33開始 
			->正常工作日(ExtendedWorkingTimeOnNormalDay, ewtNormal): 1.33開始 
			->休息日(以上兩者除外) (ExtendedWorkingTimeOnRestDay_Exceed8Hour, ewtRestMore): 1.66開始 *1
		->未超過每日8小時，但超過一週40小時(ExtendedWorkingTimeOnRestDay, ewtRest) : 0.33開始 

*/


//rule 30.1 
const normalDayTime = moment.duration(8, 'hours');
const normalWeekTime = moment.duration(40, 'hours');


//FIXME: check whether it is really month salary / 240
function calcHourSalary(monthSalary){
	return monthSalary / 240; 
}

/*
 * @param  startTime     moment
 * @param  endTime       moment
 * @param  breakDuration Duration
 */
function calcWorkingTime(startTime, endTime, breakDuration){
	if(startTime == null && endTime == null){
		return 0;
	}
	var workingTime = moment.duration(endTime.diff(startTime)).subtract(breakDuration); //FIXME
	return workingTime; 
}
exports.calcWorkingTime = calcWorkingTime;

/*
	->正常工時(NormalWorkingTime, nwt):
		->非休假日: 平日每小時工資
		->休假日(NormalWorkingTimeOnNormalDay, nwtNormal): 
			->例假日(NormalWorkingTimeOnRoutineDayOff, nwtRoutineOff): 外加8小時薪資，需補休  //TODO
			->國定休假日: 
				->輪班人員 & 調移至其他日休假: 平日每小時工資(暫不考慮)
				->否則(NormalWorkingTimeOnNationalHoliday, nwtHoliday): 外加8小時薪資，不需補休。  //TODO
			->特休日: 暫不考慮
	->延長工時(ExtendedWorkingTime, ewt)
		->超過每日8小時: 
			->休假日(ExtendedWorkingTimeOnDayOff, ewtDayOff): 1.33開始 
			->正常工作日(ExtendedWorkingTimeOnNormalDay, ewtNormal): 1.33開始 
			->休息日(以上兩者除外) (ExtendedWorkingTimeOnRestDay_Exceed8Hour, ewtRestMore): depends on ewtRest
		->未超過每日8小時，但超過一週40小時(ExtendedWorkingTimeOnRestDay, ewtRest) : 0.33開始 

	return value: [nwtNormal, nwtRoutineOff, nwtHolidayMoved] if one of them does not exist, return null;
*/
function divideWorkingTime(startTime, endTime, breakDuration, isRoutineDayOff=false){
	var workingTime = calcWorkingTime(startTime, endTime, breakDuration);
	var nwtNormal = moment.duration(0), nwtRoutineOff = moment.duration(0), nwtHoliday = moment.duration(0); 
	var ewtNormal = moment.duration(0), ewtDayOff = moment.duration(0);
	if(isRoutineDayOff){
		nwtRoutineOff = __calcNormalWorkingTime(workingTime);
		ewtDayOff += __calcExtendedWorkingTime(workingTime);
	}
	else if(isNationalHoliday(startTime)){
		nwtHoliday = __calcNormalWorkingTime(workingTime);
		ewtDayOff += __calcExtendedWorkingTime(workingTime);
	}
	else{
		nwtNormal = __calcNormalWorkingTime(workingTime);
		ewtNormal = __calcExtendedWorkingTime(workingTime);
	}
	return [nwtNormal, nwtRoutineOff, nwtHoliday, ewtNormal, ewtDayOff];
}

function __calcNormalWorkingTime(workingTime){
	return (workingTime > normalDayTime) ? normalDayTime : workingTime ; 
}
function __calcExtendedWorkingTime(workingTime){
	return (workingTime > normalDayTime) ? (workingTime - normalDayTime) : moment.duration(0) ; 
}

function divideWorkingTime_OneWeek(startTimeArr, endTimeArr, breakDurationArr, routineDayOffDay=0, restDay=6){
	const nDays = 7;
	var nwtNormalArr = new Array[nDays];
	var nwtRoutineOffArr = new Array[nDays];
	var nwtHolidayArr = new Array[nDays];
	var ewtNormalArr = new Array[nDays];
	var ewtDayOffArr = new Array[nDays];
	var ewtRestArr = new Array[nDays];
	var ewtRestMoreArr = new Array[nDays];
	var ntwWeek = moment.duration(0);
	
	//get normal working time for each day
	for(var i = 0; i < nDays; i++){
		var isRoutineDayOff = __checkRoutineDayOff(startTimeArr[i], routineDayOffDay);
		var isNationalHoliday = isNationalHoliday(startTimeArr[i]);
		[nwtNormalArr[i], nwtRoutineOffArr[i], nwtHolidayArr[i], ewtNormalArr, ewtDayOffArr] = divideWorkingTime(startTimeArr[i], endTimeArr[i], breakDurationArr[i], isRoutineDayOff);
		ntwWeek.add(nwtNormalArr[i]);		
	}
	/*if sum of normal working time for is longer than normal working time per week, distribute those
		normal working time to extended working time 
	*/
	if(ntwWeek > normalWeekTime){
		var extended = __calcExtendedWeekWorkingTime(ntwWeek);
		mapping = __getDayMapping(startTimeArr);
		var index = mapping[restDay];
		if(extended <= nwtNormalArr[index]){
			ewtRestArr[index] = extended;
			ewtRestMoreArr[index] = ewtNormalArr[index];
			
			ewtNormalArr[index] = moment.duration(0);
			nwtNormalArr[index] = nwtNormalArr[index] - extended;
		}
		else{
			//should be impossible
			throw "Bug";
		}
	}

	return [nwtNormalArr, nwtRoutineOffArr, nwtHolidayArr, ewtNormalArr, ewtDayOffArr, ewtRestArr, ewtRestMoreArr];
}

function __calcExtendedWeekWorkingTime(workingTime){
	return (workingTime > normalWeekTime) ? (workingTime - normalWeekTime) : moment.duration(0) ; 
}

function __checkRoutineDayOff(date, routineDayOffDay){
	return date.day() == routineDayOffDay;
}

function __getDayMapping(dateArr){
	var nDays = dateArr.length;
	var mapping = new Array[nDays];
	for(var i=0; i < nDays; i++){
		var day = dateArr[i].day();
		mapping[day] = i;
	}
	return mapping;
}

//TODO
function isNationalHoliday(date){
	return false;
}


function calcOvertimeSalary(nwtRoutineOff, nwtHoliday, ewtNormal, ewtDayOff, ewtRest, ewtRestMore, hourSalary, bonus=[4.0/3.0, 5.0/3.0, 5.0/3.0]){
	var salary = 0.0;
	if(nwtRoutineOff != 0 || nwtHoliday != 0){
		salary += normalDayTime.hours() * hourSalary;
	}

	if(ewtNormal != 0 || ewtDayOff != 0){ //one of them should be 0
		var h = (ewtNormal + ewtDayOff).hours(); 
		var base = 2;
		for(var i = 0; i < bonus.length - 1; i++){
			if(h > base){
				salary += base * hourSalary * bonus[i];
				h -= base; 
			}
			else{
				salary += h * hourSalary * bonus[i];
				h = 0;
				break;
			}
		}
		if(h > 0){
			salary += h * hourSalary * bonus[bonus.length -1];
		}
	}
	else if(ewtRest != 0 || ewtRestMore != 0){

	}

}

function calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, routineDayOffDay=0, restDay=6){
	[nwtNormalArr, nwtRoutineOffArr, nwtHolidayArr, ewtNormalArr, ewtDayOffArr, 
		ewtRestArr, ewtRestMoreArr] = divideWorkingTime_OneWeek(startTimeArr, endTimeArr, 
			breakDurationArr, routineDayOffDay, restDay);

}

})(e, m);
})();
