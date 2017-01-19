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

function Working() {
    this.startTime     = moment();
    this.endTime       = moment();
    this.breakDuration = moment.duration(0);
    this.isBreak       = true;
}
exports.Working = Working;

Working.prototype = {
    clone: function() {
        var w = new Working();
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                if (this[key] instanceof moment) {
                    w[key] = this[key].clone();
                } else if (moment.isDuration(this[key])) {
                    w[key] = moment.duration(this[key]);
                } else {
                    // FIXME
                    w[key] = this[key];
                }
            }
        }
        return w;
    },
};

function WorkingCollection() {
    this.data = [];
    this.hourSalary = 0;
}
exports.WorkingCollection = WorkingCollection;

WorkingCollection.prototype = {
    push: function(d) {
        this.data.push(d);
        return this;
    },
};

//rule 30.1 
const normalDayTime = moment.duration(8, 'hours');
const normalWeekTime = moment.duration(40, 'hours');


//FIXME: check whether it is really month salary / 240
function calcHourSalary(monthSalary){
	return monthSalary / 240; 
}

Working.prototype.calcHourSalary = function() {
    this.hourSalary = calcHourSalary(this.monthSalary);
    return this;
}

/*
 * @param  startTime     moment
 * @param  endTime       moment
 * @param  breakDuration Duration
 */
function calcWorkingTime(startTime, endTime, breakDuration){
	if(startTime == null && endTime == null){
		return moment.duration(0);
	}
	var workingTime = moment.duration(endTime.diff(startTime)).subtract(breakDuration);
	return workingTime; 
}
exports.calcWorkingTime = calcWorkingTime;

Working.prototype.calcWorkingTimeDuration = function() {
    this.workingTimeDuration = calcWorkingTime(this.startTime, this.endTime, this.breakDuration);
    return this;
}

/*
 * @param  startTime     moment
 * @param  endTime       moment
 * @param  breakDuration Duration
 * @param  isRoutineDayOff boolean
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
function divideWorkingTime(startTime, endTime, breakDuration, isRoutineDayOff){
   	if (typeof(isRoutineDayOff)==='undefined') isRoutineDayOff = false;
   
	var workingTime = calcWorkingTime(startTime, endTime, breakDuration);
	var nwtNormal = moment.duration(0), nwtRoutineOff = moment.duration(0), nwtHoliday = moment.duration(0); 
	var ewtNormal = moment.duration(0), ewtDayOff = moment.duration(0);
	if(isRoutineDayOff){
		nwtRoutineOff = __calcNormalWorkingTime(workingTime);
		ewtDayOff.add(__calcExtendedWorkingTime(workingTime));
	}
	else if(isNationalHoliday(startTime)){
		nwtHoliday = __calcNormalWorkingTime(workingTime);
		ewtDayOff.add(__calcExtendedWorkingTime(workingTime));
	}
	else{
		nwtNormal = __calcNormalWorkingTime(workingTime);
		ewtNormal = __calcExtendedWorkingTime(workingTime);
	}
	return [nwtNormal, nwtRoutineOff, nwtHoliday, ewtNormal, ewtDayOff];
}

/*
 * Based on this.isRoutineDayOff, this.workingTimeDuration;
 */
Working.prototype.divideWorkingTime = function() {
    // FIXME
    this.isRoutineDayOff = this.isRoutineDayOff || false;

    this.calcWorkingTimeDuration()
        .calcIsNationalHoliday();

    this._workingTime = {
        normal: {
            normalDay: moment.duration(0),
            routineDayOff: moment.duration(0),
            nationalHoliday: moment.duration(0),
        },
        extended: {
            normalDay: moment.duration(0),
            dayOff: moment.duration(0),
        },
    };

    var nwt = this._workingTime.normal;
    var ewt = this._workingTime.extended;

    if (this.isRoutineDayOff) {
        nwt.routineDayOff = __calcNormalWorkingTime(this.workingTimeDuration);
        ewt.dayOff = __calcExtendedWeekWorkingTime(this.workingTimeDuration);

        return this;
    }

    if (this.isNationalHoliday) {
        nwt.nationalHoliday = __calcNormalWorkingTime(this.workingTimeDuration);
        ewt.dayOff = __calcExtendedWorkingTime(this.workingTimeDuration);

        return this;
	}

    nwt.normalDay = __calcNormalWorkingTime(this.workingTimeDuration);
    ewt.normalDay = __calcExtendedWorkingTime(this.workingTimeDuration);

    return this;
};

Working.prototype.calcIsNationalHoliday = function() {
    this.isNationalHoliday = isNationalHoliday(this.startTime);
    return this;
}

function __calcNormalWorkingTime(workingTime){
	return (workingTime > normalDayTime) ? moment.duration(normalDayTime) : workingTime ; 
}
function __calcExtendedWorkingTime(workingTime){
	return (workingTime > normalDayTime) ? moment.duration(workingTime - normalDayTime) : moment.duration(0) ; 
}

/*
 * @param  startTimeArr     array of moment
 * @param  endTimeArr       array of moment
 * @param  breakDurationArr array of Duration
 * @param  routineDayOffDay number(from 0 to 6)
 * @param  restDay          number(from 0 to 6)
*/
function divideWorkingTime_OneWeek(startTimeArr, endTimeArr, breakDurationArr, routineDayOffDay, restDay){
	if (typeof(routineDayOffDay)==='undefined') routineDayOffDay = 0;
	if (typeof(restDay)==='undefined') restDay = 6;

	const nDays = 7;
	var nwtNormalArr = new Array();
	var nwtRoutineOffArr = new Array();
	var nwtHolidayArr = new Array();
	var ewtNormalArr = new Array();
	var ewtDayOffArr = new Array();
	var ewtRestArr = new Array();
	var ewtRestMoreArr = new Array();
	var nwtWeek = moment.duration(0);
	
	//get normal working time for each day
	for(var i = 0; i < nDays; i++){
		var isRoutineDayOff = __checkRoutineDayOff(startTimeArr[i], routineDayOffDay);
		[nwtNormalArr[i], nwtRoutineOffArr[i], nwtHolidayArr[i], ewtNormalArr[i], 
			ewtDayOffArr[i]] = divideWorkingTime(startTimeArr[i], endTimeArr[i], breakDurationArr[i], isRoutineDayOff);

		ewtRestArr[i] = moment.duration(0);
		ewtRestMoreArr[i] = moment.duration(0);
		nwtWeek.add(nwtNormalArr[i]);		
	}
	/*if sum of normal working time for is longer than normal working time per week, distribute those
		normal working time to extended working time 
	*/
	if(nwtWeek > normalWeekTime){ //nwtWeek is the sum of normal working time for each day, must less than 48hrs
		var extended = __calcExtendedWeekWorkingTime(nwtWeek); //extended is the part which is over 40 hrs
		mapping = __getDayMapping(startTimeArr);
		var index = mapping[restDay];
		if(extended <= nwtNormalArr[index]){  //the range of extended is [0, 8hr], and all of them should be on rest day
			ewtRestArr[index] = extended;
			ewtRestMoreArr[index] = ewtNormalArr[index];
			
			ewtNormalArr[index] = moment.duration(0);
			nwtNormalArr[index].subtract(extended);
		}
		else{  
			//should be impossible
			throw "Bug";
		}
	}

	return [nwtNormalArr, nwtRoutineOffArr, nwtHolidayArr, ewtNormalArr, ewtDayOffArr, ewtRestArr, ewtRestMoreArr];
}

function __calcExtendedWeekWorkingTime(workingTime){
	return (workingTime > normalWeekTime) ? moment.duration(workingTime - normalWeekTime) : moment.duration(0) ; 
}

function __checkRoutineDayOff(date, routineDayOffDay){
	if(date === null) { return false; }
	return date.day() == routineDayOffDay;
}

function __getDayMapping(dateArr){
	var nDays = dateArr.length;
	var mapping = new Array();
	for(var i=0; i < nDays; i++){
		if(dateArr[i] !== null){
			var day = dateArr[i].day();
			mapping[day] = i;	
		}
	}
	return mapping;
}

//TODO
function isNationalHoliday(date){
	return false;
}
exports.isNationalHoliday = isNationalHoliday;


function calcOvertimeSalary(nwtRoutineOff, nwtHoliday, ewtNormal, ewtDayOff, 
	ewtRest, ewtRestMore, hourSalary, salaryBonus){
	if (typeof(salaryBonus)==='undefined') salaryBonus = [4.0/3.0, 5.0/3.0, 5.0/3.0];

	var salary = 0.0;
	var h = 0; 
	if(nwtRoutineOff != 0 || nwtHoliday != 0){
		salary += normalDayTime.hours() * hourSalary;
	}

	if(ewtNormal != 0){ 
		h = ewtNormal.hours();
	}
	else if(ewtDayOff != 0){
		h = ewtDayOff.hours();
	}
	else if(ewtRest != 0 || ewtRestMore != 0){
		h = ewtRest.hours() + ewtRestMore.hours();
	}

	//calculate overtime salary 
	var base = 2;
	for(var i = 0; i < salaryBonus.length - 1; i++){
		if(h > base){
			salary += base * hourSalary * salaryBonus[i];
			h -= base; 
		}
		else{
			salary += h * hourSalary * salaryBonus[i];
			h = 0;
			break;
		}
	}
	if(h > 0){
		salary += h * hourSalary * salaryBonus[salaryBonus.length - 1];
	}
	
	//subtract the money already given
	if(ewtRest != 0){
		salary -= ewtRest.hours() * hourSalary; 
	}
	return salary;
}

function calcOvertimeSalary_OneWeek(startTimeArr, endTimeArr, breakDurationArr, hourSalary, 
	routineDayOffDay, restDay, salaryBonus){
	if (typeof(routineDayOffDay)==='undefined') routineDayOffDay = 0;
	if (typeof(restDay)==='undefined') restDay = 6;
	if (typeof(salaryBonus)==='undefined') salaryBonus = [4.0/3.0, 5.0/3.0, 5.0/3.0];

	[nwtNormalArr, nwtRoutineOffArr, nwtHolidayArr, ewtNormalArr, ewtDayOffArr, 
		ewtRestArr, ewtRestMoreArr] = divideWorkingTime_OneWeek(startTimeArr, endTimeArr, 
			breakDurationArr, routineDayOffDay, restDay);

	const nDays = 7;		
	var overtimeSalary = 0.0;
	for(var i = 0; i < nDays; i++){
		overtimeSalary += calcOvertimeSalary(nwtRoutineOffArr[i], nwtHolidayArr[i], 
			ewtNormalArr[i], ewtDayOffArr[i], ewtRestArr[i], ewtRestMoreArr[i], hourSalary, salaryBonus);
	}
	return overtimeSalary;
}
exports.calcOvertimeSalary_OneWeek = calcOvertimeSalary_OneWeek;

WorkingCollection.prototype.divideWorkingTime = function() {
    return this;
}

WorkingCollection.prototype.calcOvertimeSalary = function() {
    return this;
};


})(e, m);
})();

