/**
 * Created by ZIV on 13/12/2016.
 */
var mongoose = require('mongoose'),
    googleMaps = require('../../app/controllers/googleMaps.server.controller'),
    sportEvt = require('../../app/controllers/sportEvts.server.controller'),
    notifics = require('../../app/controllers/notifics.server.controller'),
    schedule = require('node-schedule'),
    SportEvt = mongoose.model('SportEvt'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User'),
    Notific = mongoose.model('Notific'),
    Court = mongoose.model('Court');

var serviceTime = '* * 3 * * *';


exports.contains = function ( a, needle ) {
    for (var i = 0; i < a.length; i++) {
        if (JSON.stringify(a[i]) === JSON.stringify(needle))
        {
            return true;
        }
    }
    return false;
};

var minutesToString = function (minutes) {
    var hours   = Math.floor(minutes / 60);
    minutes = minutes - (hours * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    return hours +':'+ minutes
};

exports.setTimesArr = function(sizeOfDay)
{
    //start at 5:00
    var i;
    var time = 300;
    var arr = [];
    var gap = (24*60/sizeOfDay);

    for (i = 0; i < sizeOfDay; i++)
    {


        arr[i] = {
            "index": i,
            "timeInMin": time,
            "timeAsString": minutesToString(time),
            "isIn": false
        };


        time = time + gap;
        if (time > (23.5*60))
        {
            time = 0;
        }
    }
    return arr;
};

var matchingArrTimes = function(numberOfDays, sizeForDay, todayDate, tomorrowDate, todayDay, tomorrowDay)
{
    //start at 5:00
    var i;
    var time = 300;
    var arr = [];
    var gap = (24*60/sizeForDay);
    var theDate = todayDate;
    var theDay = todayDay;

    for (i = 0; i < sizeForDay*numberOfDays; i++)
    {

        arr[i] = {
            "index": i,
            "theDate": theDate,
            "theDay": theDay,
            "timeInMin": time,
            "timeAsString": minutesToString(time),
            "relevantEvents": [],
            "relevantUsers": []
        };


        time = time + gap;
        if (time > (23.5*60))
        {
            theDate = tomorrowDate;
            theDay = tomorrowDay;
            time = 0;
        }
    }
    return arr;
};

var getTodayDate = function (currTime) {
    var todayDate = currTime;
    todayDate = todayDate.toISOString().split('T')[0];
    return todayDate;
};

var getTomorrowDate = function (currTime) {

    var tomorrowDate = currTime;
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDate = tomorrowDate.toISOString().split('T')[0];
    return tomorrowDate;
};

var setTimezoneOffset = function (timezoneOffset, theTime) {
    var timeInMin = theTime.timeInMin - timezoneOffset;
    if(timeInMin < 0)
    {
        timeInMin = 1440 + timeInMin; //1440 minutes in a day.
    }
    else if(timeInMin >= 1440)
    {
        timeInMin = timeInMin-1440;
    }
    return timeInMin;
};

var checkIfUserIsRelevant = function (user, todayDay, tomorrowDay, flexRange) {

    var relevantTimes = [];
    var timezoneOffset = user.localTimeZoneOffsetInMIn;
    var lastTimeInMin = -1000;
    for(var hoursIndex = 0; hoursIndex < user.favoriteTimes[0].favoriteHours.length; hoursIndex++) {

        var theTime = user.favoriteTimes[todayDay].favoriteHours[hoursIndex];
        if (theTime.isIn) {
            var timeInMin;
            if (timezoneOffset) {

                timeInMin = setTimezoneOffset(timezoneOffset, theTime);

            }
            else {
                timeInMin = theTime.timeInMin;
            }
           if ((timeInMin - lastTimeInMin) > (flexRange*2)) {
              relevantTimes.push({
                    "user": user,
                    "day": todayDay,
                    "timeInMin": timeInMin
                });
               lastTimeInMin = timeInMin;
           }
        }
    }
    lastTimeInMin = -1000;
    for(hoursIndex = 0; hoursIndex < user.favoriteTimes[0].favoriteHours.length; hoursIndex++)
    {
        theTime = user.favoriteTimes[tomorrowDay].favoriteHours[hoursIndex];
        if(theTime.isIn)
        {
            if(timezoneOffset)
            {
                timeInMin = setTimezoneOffset(timezoneOffset, theTime);
            }
            else {
                timeInMin = theTime.timeInMin;
            }
           if((timeInMin - lastTimeInMin) > (flexRange*2))
           {
                relevantTimes.push({
                    "user": user,
                    "day": tomorrowDay,
                    "timeInMin": timeInMin
                });
               lastTimeInMin = timeInMin;
           }
        }
    }
    return relevantTimes;
};


var getArrTimeOfEventsAndUsers = function (callback) {

    var currTime = new Date();
    var todayDay = currTime.getDay();
    var tomorrowDay;
    if(todayDay != 6)
        tomorrowDay = todayDay+1;
    else{
        tomorrowDay = 0;
    }
    var todayDate = getTodayDate(currTime);
    var tomorrowDate = getTomorrowDate(currTime);

    var numberOfDays = 2;
    var sizeForDay = 48;
    var flexRange = 60;
    var eventsRange = 1440 / sizeForDay / 2;

    var arrTimesTwoDays = matchingArrTimes(numberOfDays, sizeForDay, todayDate, tomorrowDate, todayDay, tomorrowDay);
    //console.info("arrTimesTwoDays: " + JSON.stringify(arrTimesTwoDays));
    SportEvt.find({$and: [{$or: [{dateEvtAsString: todayDate}, {dateEvtAsString: tomorrowDate}]}, {openForIndividuals: true}]},
        '_id dateEvtAsString startTimeAsString sportType startTimeInMin court allParticipantsAndNotific minNumOfMembers maxNumOfMembers optNumOfMembers')
        .sort('startTimeInMin').populate('sportType court allParticipantsAndNotific.theUser allParticipantsAndNotific.notific', 'title gpsLocation country city status suggestionStatus').exec(function(err, sportEvtTodayAndTomorrow)
    {
        if (err) {}
        else {
            //console.info("matchingArr: " + JSON.stringify(sportEvtTodayAndTomorrow) + " " + sportEvtTodayAndTomorrow.length);
            for(var eventIndex = 0; eventIndex < sportEvtTodayAndTomorrow.length; eventIndex++)
            {
                var currCounter = sportEvt.getCurrentCounter(sportEvtTodayAndTomorrow[eventIndex]);

                if(sportEvtTodayAndTomorrow[eventIndex].maxNumOfMembers == null || currCounter.in < sportEvtTodayAndTomorrow[eventIndex].maxNumOfMembers)
                {
                    var eventStartTimeInMin = sportEvtTodayAndTomorrow[eventIndex].startTimeInMin;
                    var eventDateAsString = sportEvtTodayAndTomorrow[eventIndex].dateEvtAsString;
                    var  dateInMin = (new Date(eventDateAsString).getTime() / 60000);
                    eventStartTimeInMin = eventStartTimeInMin - dateInMin;

                    for(var timeIndex = 0; timeIndex < arrTimesTwoDays.length; timeIndex++)
                    {
                        if(eventDateAsString == arrTimesTwoDays[timeIndex].theDate && Math.abs(eventStartTimeInMin - arrTimesTwoDays[timeIndex].timeInMin) <= eventsRange)
                        {
                            arrTimesTwoDays[timeIndex].relevantEvents.push(sportEvtTodayAndTomorrow[eventIndex])
                        }
                    }
                }
            }
            User.find({isSearched: true}, '_id gpsLocation favoriteTimes sportTypes radiusOfSearch country city username localTimeZoneOffsetInMIn email myRejectedSportEvts rejectEventsResults')
                .populate('sportTypes myRejectedSportEvts', 'title dateEvtAsString startTimeAsString sportType startTimeInMin court minNumOfMembers maxNumOfMembers optNumOfMembers creator groups minAge maxAge forFemale forMale duration').exec(function(err, usersTodayAndTomorrow)
            {
                if (err) {}
                else {
                    //console.info("usersTodayAndTomorrow.length: " + usersTodayAndTomorrow.length);
                    for (var userIndex = 0; userIndex < usersTodayAndTomorrow.length; userIndex++)
                    {
                        var relevantTimesPerUser = checkIfUserIsRelevant(usersTodayAndTomorrow[userIndex] ,todayDay ,tomorrowDay, flexRange);
                        for (var itemIndex = 0; itemIndex < relevantTimesPerUser.length; itemIndex++)
                        {
                            var userTime = relevantTimesPerUser[itemIndex].timeInMin;
                            var userDay = relevantTimesPerUser[itemIndex].day;
                            for (var timeIndex = 0; timeIndex < arrTimesTwoDays.length; timeIndex++)
                            {

                                if(Math.abs(userTime - arrTimesTwoDays[timeIndex].timeInMin) <= flexRange && userDay == arrTimesTwoDays[timeIndex].theDay)
                                {
                                    arrTimesTwoDays[timeIndex].relevantUsers.push(relevantTimesPerUser[itemIndex]);
                                }
                            }
                        }
                    }
                    return callback(arrTimesTwoDays);
                }
            });
        }
    });

};

//var j = schedule.scheduleJob(serviceTime, function(){

    exports.matchingUsersAndEvents = function (req, res) {


        getArrTimeOfEventsAndUsers(function (matchingArr) {

            var allSuggestions = [];
            var arrToReturn = [];
            var param;
            var numOfItemsWithRadius = 0;

            //var optionsCounter = 0;
            //console.info("matchingArr: " + matchingArr);
            for (var timesIndex = 0; timesIndex < matchingArr.length; timesIndex++)
            {
                for (var eventIndex = 0; eventIndex < matchingArr[timesIndex].relevantEvents.length; eventIndex++)
                {
                    for (var userIndex = 0; userIndex < matchingArr[timesIndex].relevantUsers.length; userIndex++)
                    {
                       //console.info("matchingArr: " + matchingArr[timesIndex].timeAsString + " relevantUsers: " + JSON.stringify(matchingArr[timesIndex].relevantUsers[userIndex].user.username) + " relevantEvents: " + JSON.stringify(matchingArr[timesIndex].relevantEvents[eventIndex]._id));
                        var eventItem = matchingArr[timesIndex].relevantEvents[eventIndex];
                        var userItem = matchingArr[timesIndex].relevantUsers[userIndex];
                        //console.info("userItem1: " + userItem.user._id + " eventItem1: " + eventItem._id);
                        var isUserInEvent = userInEvent(userItem, eventItem);
                        if (!isUserInEvent)
                        {
                            var funcArr = [];
                            var paramArr = [];
                            //console.info("userItem2: " + userItem.user._id + " eventItem2: " + eventItem._id);
                            if(userItem.user.country && eventItem.court.country)
                            {
                                funcArr.push(matchByCountry);
                                param = {
                                    userCountry: userItem.user.country,
                                    eventCountry: eventItem.court.country
                                };
                                paramArr.push(param);
                            }
                            if(userItem.user.sportTypes && eventItem.sportType)
                            {
                                funcArr.push(matchBySportType);
                                param = {
                                    userSportTypes: userItem.user.sportTypes,
                                    eventSportType: eventItem.sportType
                                };
                                paramArr.push(param);
                            }
                            if(userItem.user.city && eventItem.court.city)
                            {
                                funcArr.push(matchByCity);
                                param = {
                                    userCity: userItem.user.city,
                                    eventCity: eventItem.court.city
                                };
                                paramArr.push(param);
                            }
                            if(userItem.user.yearOfBirth)
                            {

                                var userAge = new Date().getFullYear() - userItem.user.yearOfBirth;
                                if(eventItem.minAge)
                                {
                                    funcArr.push(matchByMinAge);

                                    param = {
                                        userAge: userAge,
                                        eventMinAge: eventItem.minAge
                                    };
                                    paramArr.push(param);
                                }
                                if(eventItem.maxAge)
                                {
                                    funcArr.push(matchByMaxAge);

                                    param = {
                                        userAge: userAge,
                                        eventMaxAge: eventItem.maxAge
                                    };
                                    paramArr.push(param);
                                }
                            }
                            if(userItem.user.gender)
                            {
                                if((!eventItem.forFemale && eventItem.forMale) || (eventItem.forFemale && !eventItem.forMale))
                                {
                                    funcArr.push(matchByGender);
                                    if(eventItem.forFemale)
                                    {
                                        param = {
                                            userGender: userItem.user.gender,
                                            eventGender: 'female'
                                        };
                                        paramArr.push(param);
                                    }
                                    else if(eventItem.forMale)
                                    {
                                        param = {
                                            userGender: userItem.user.gender,
                                            eventGender: 'male'
                                        };
                                        paramArr.push(param);
                                    }
                                }
                            }

                            var isMatch = true;
                            for (var funcIndex = 0; funcIndex < funcArr.length; funcIndex++) {
                                if (!funcArr[funcIndex](paramArr[funcIndex])) {
                                    //console.info("userItem2: " + userItem.user._id + " eventItem2: " + eventItem._id + " funcIndex: " + funcIndex);
                                    isMatch = false;
                                    break;
                                }
                            }
                            if (isMatch) {
                                if(userItem.user.radiusOfSearch && userItem.user.radiusOfSearch > 0)
                                {
                                    numOfItemsWithRadius++
                                }
                                //notifics.createEventSuggestionNotific(eventItem, userItem.user);
                                allSuggestions.push({
                                    "user": userItem.user,
                                    "event": eventItem
                                });
                                console.info("userItem3: " + userItem.user._id + " eventItem3: " + eventItem._id);
                            }
                        }
                    }
                }
            }
            var finishCheckRadius = false;
            var eventCheckedCounter = 0;
            //console.info("numOfItemsWithRadius_main: " + numOfItemsWithRadius);
            if(numOfItemsWithRadius == 0)
            {
                finishCheckRadius = true;
                arrToReturn = allSuggestions;
            }
            console.info("allSuggestions: " + allSuggestions);
            console.info("allSuggestions.length: " + allSuggestions.length);
            for(var suggIndex = 0; suggIndex < allSuggestions.length; suggIndex++)
            {
                var user = allSuggestions[suggIndex].user;
                if(user.radiusOfSearch && user.radiusOfSearch > 0)
                {
                    var userLocation = user.gpsLocation;
                    var courtLocation = allSuggestions[suggIndex].event.court.gpsLocation;

                    googleMaps.getDistanceBetweenTwoAddresses(user.radiusOfSearch,1,userLocation, courtLocation, function (radiusOfSearch,b,distance) {
                        distance = distance /1000;

                        //console.info("numOfItemsWithRadius1: " + numOfItemsWithRadius);
                        if (distance <= radiusOfSearch) {
                            //console.info("distance1: " + distance);
                            //console.info("radius1: " + radiusOfSearch);
                            arrToReturn.push(allSuggestions[eventCheckedCounter]);
                            notifics.createEventSuggestionNotific(allSuggestions[eventCheckedCounter].event, allSuggestions[eventCheckedCounter].user);
                        }
                        else {
                            //console.info("eventCheckedCounter2: " + eventCheckedCounter);
                        }
                        eventCheckedCounter++;
                        //console.info("eventCheckedCounter: " + eventCheckedCounter);
                        if (eventCheckedCounter >= numOfItemsWithRadius) {
                            //console.info("finishCheckRadius = true;");
                            finishCheckRadius = true;
                            //console.info("arrToReturn: " + arrToReturn);
                            res.json(arrToReturn);
                        }
                    });
                }
                else {
                    arrToReturn.push(allSuggestions[suggIndex]);
                    notifics.createEventSuggestionNotific(allSuggestions[suggIndex].event, allSuggestions[suggIndex].user);
                }
            }
            if(finishCheckRadius)
            {
                //console.info("arrToReturn: " + arrToReturn);
                for(suggIndex = 0; suggIndex < allSuggestions.length; suggIndex++)
                {
                    notifics.createEventSuggestionNotific(allSuggestions[suggIndex].event, allSuggestions[suggIndex].user);
                }
                res.json(arrToReturn);
            }
            else if(!allSuggestions || !allSuggestions.length || allSuggestions.length < 1)
            {
                //console.info("res.json(arrToReturn);2");
                res.json(arrToReturn);
            }

        });
    };

//});
var userInEvent = function (userItem, eventItem) {

    for (var memberIndex = 0; memberIndex < eventItem.allParticipantsAndNotific.length; memberIndex++) {

        if (userItem.user._id == eventItem.allParticipantsAndNotific[memberIndex].theUser.id) {
            return true;
        }
    }
    return false;
};
/*------------------------search functions-----------------------------*/
exports.searchByCountry = function(country, group)
{
    return country.toUpperCase() == group.defaultCourt.country.toUpperCase();
};
exports.searchByCityOfEvent = function(city, sportEvt)
{
    return city.toUpperCase() == sportEvt.court.city.toUpperCase();
};
exports.searchBySportTypeOfUser = function(sportType, user)
{
    for(var i = 0; i < user.sportTypes.length; i++)
    {
        if(user.sportTypes[i] == sportType)
        {
            return true
        }
    }
    return false;
};
exports.searchBySportTypeOfGroup = function(sportType, group)
{
    console.info("sportType: " + sportType);
    console.info("group.theSportType: " + group.theSportType._id);
    return sportType == group.theSportType._id;
};
exports.searchByCityOfItem = function(city, item)
{
    return city.toUpperCase() == item.city.toUpperCase();
};
exports.searchByCityOfGroup = function(city, group)
{
    return city.toUpperCase() == group.defaultCourt.city.toUpperCase();
};
exports.searchByMaxStartTime = function(maxStartTime, sportEvt)
{
    var startTimeInMinInThisDate = (Number(sportEvt.startTimeAsString.split(":")[0])*60
    + Number(sportEvt.startTimeAsString.split(":")[1]));

    var maxStartTimeInMinInThisDate = (Number(maxStartTime.split(":")[0])*60
    + Number(maxStartTime.split(":")[1]));

    return startTimeInMinInThisDate <= maxStartTimeInMinInThisDate;

};
exports.searchByMinStartTime = function(minStartTime, sportEvt)
{
    var startTimeInMinInThisDate = (Number(sportEvt.startTimeAsString.split(":")[0])*60
    + Number(sportEvt.startTimeAsString.split(":")[1]));

    var minStartTimeInMinInThisDate = (Number(minStartTime.split(":")[0])*60
    + Number(minStartTime.split(":")[1]));

    return startTimeInMinInThisDate >= minStartTimeInMinInThisDate;

};
exports.searchByMaxMembers = function(maxMembers, sportEvt)
{
    return maxMembers >= sportEvt.maxNumOfMembers || !sportEvt.maxNumOfMembers;
};
exports.searchByMinMembers = function(minMembers, sportEvt)
{
    return minMembers <= sportEvt.minNumOfMembers || !sportEvt.minNumOfMembers;
};
exports.searchByMaxMembersInGroup = function(maxMembers, group)
{
    return maxMembers >= group.members.length;
};
exports.searchByMinMembersInGroup = function(minMembers, group)
{
    return minMembers <= group.members.length;
};
exports.searchByMaxAge = function(maxAge, sportEvt)
{
    return maxAge >= sportEvt.maxAge || !sportEvt.maxAge;
};
exports.searchByMinAge = function(minAge, sportEvt)
{
    return minAge <= sportEvt.minAge || !sportEvt.minAge;
};
exports.searchByGender = function(gender, sportEvt)
{
    return (gender == 'male' && sportEvt.forMale) || (gender == 'female' && sportEvt.forFemale)
};


var matchByCountry = function(param)
{
    return param.userCountry.toUpperCase() == param.eventCountry.toUpperCase();
};
var matchBySportType = function(param)
{
    for(var i = 0; i < param.userSportTypes.length; i++)
    {
        if(param.eventSportType.id == param.userSportTypes[i].id)
        {
            return true;
        }
    }

    return false;
};
var matchByCity = function(param)
{
    return param.userCity.toUpperCase() == param.eventCity.toUpperCase();
};
var matchByMinAge = function(param)
{
    return param.userAge >= param.eventMinAge;
};
var matchByMaxAge = function(param)
{
    return param.userAge <= param.eventMaxAge;
};
var matchByGender = function(param)
{
    return param.userGender == param.eventGender;
};

/*------------------------rejectEvents-----------------------------*/


/*exports.rejectEvents = function (user) {

    console.info("NEW");
    var rejectEventsResults;
    if(!user.rejectEventsResults)
    {
        console.info(user.id + "NEW");
        rejectEventsResults = module.exports.initialRejectArray(user);
    }
    else {
        rejectEventsResults = user.rejectEventsResults;
    }
    if(user.myRejectedSportEvts)
    {
        var rejectEvents = user.myRejectedSportEvts;
        for(var rejectEvtIndex = 0; rejectEvtIndex < rejectEvents.length; rejectEvtIndex++)
        {
            rejectEventsResults = module.exports.addRejectEvt(user, rejectEventsResults, rejectEvents[rejectEvtIndex]);
        }
       console.info("rejectEventsResults: " + JSON.stringify(rejectEventsResults));
        return rejectEventsResults;
    }
};*/

exports.addRejectEvt = function (user, rejectEventsResults, theEvent) {

     if(theEvent.dateEvtAsString)
    {
        var day = new Date(theEvent.dateEvtAsString).getDay();
        if(rejectEventsResults.day[day])
        {
            rejectEventsResults.day[day]++;
        }
        else
        {
            rejectEventsResults.day[day] = 1;
        }
    }
    if(theEvent.startTimeAsString)
    {
        var startTimeInHour = (Number(theEvent.startTimeAsString.split(":")[0])*60
        + Number(theEvent.startTimeAsString.split(":")[1]));
        startTimeInHour = startTimeInHour / 60;
        if(rejectEventsResults.startTimeInHour[startTimeInHour])
        {
            rejectEventsResults.startTimeInHour[startTimeInHour]++;
        }
        else
        {
            rejectEventsResults.startTimeInHour[startTimeInHour] = 1;
        }
    }
    if(theEvent.duration)
    {
        if(rejectEventsResults.duration.length)
        {
            rejectEventsResults.duration.length++;
        }
        else
        {
            rejectEventsResults.duration.length = 1;
        }
        rejectEventsResults.duration.avg = (rejectEventsResults.duration.avg + theEvent.duration) / rejectEventsResults.duration.length;
    }
    if(theEvent.minNumOfMembers)
    {
        if(rejectEventsResults.minNumOfMembers.length)
        {
            rejectEventsResults.minNumOfMembers.length++;
        }
        else
        {
            rejectEventsResults.minNumOfMembers.length = 1;
        }
        rejectEventsResults.minNumOfMembers.avg = (rejectEventsResults.minNumOfMembers.avg + theEvent.minNumOfMembers) / rejectEventsResults.minNumOfMembers.length;
    }
    if(theEvent.maxNumOfMembers)
    {
        if(rejectEventsResults.maxNumOfMembers.length)
        {
            rejectEventsResults.maxNumOfMembers.length++;
        }
        else
        {
            rejectEventsResults.maxNumOfMembers.length = 1;
        }
        rejectEventsResults.maxNumOfMembers.avg = (rejectEventsResults.maxNumOfMembers.avg + theEvent.maxNumOfMembers) / rejectEventsResults.maxNumOfMembers.length;
    }
    if(theEvent.optNumOfMembers)
    {
        if(rejectEventsResults.optNumOfMembers.length)
        {
            rejectEventsResults.optNumOfMembers.length++;
        }
        else
        {
            rejectEventsResults.optNumOfMembers.length = 1;
        }
        rejectEventsResults.optNumOfMembers.avg = (rejectEventsResults.optNumOfMembers.avg + theEvent.optNumOfMembers) / rejectEventsResults.optNumOfMembers.length;
    }
    if(theEvent.minAge)
    {
        if(rejectEventsResults.minAge.length)
        {
            rejectEventsResults.minAge.length++;
        }
        else
        {
            rejectEventsResults.minAge.length = 1;
        }
        rejectEventsResults.minAge.avg = (rejectEventsResults.minAge.avg + theEvent.minAge) / rejectEventsResults.minAge.length;
    }
    if(theEvent.maxAge)
    {
        if(rejectEventsResults.maxAge.length)
        {
            rejectEventsResults.maxAge.length++;
        }
        else
        {
            rejectEventsResults.maxAge.length = 1;
        }
        rejectEventsResults.maxAge.avg = (rejectEventsResults.maxAge.avg + theEvent.maxAge) / rejectEventsResults.maxAge.length;
    }
    if(theEvent.forFemale)
    {
        rejectEventsResults.forFemale.yes++;
    }
    else
    {
        rejectEventsResults.forFemale.no++;
    }
    if(theEvent.forMale)
    {
        rejectEventsResults.forMale.yes++;
    }
    else
    {
        rejectEventsResults.forMale.no++;
    }
    if(theEvent.court)
    {
        rejectEventsResults.court.push(theEvent.court);
    }
    if(theEvent.groups.length > 0)
    {
        for(var i = 0; i < theEvent.groups.length; i++)
        {
            rejectEventsResults.groups.push(theEvent.groups[i]);
        }
    }
    if(theEvent.sportType)
    {
        rejectEventsResults.sportType.push(theEvent.sportType);
    }
    if(theEvent.creator)
    {
        rejectEventsResults.creator.push(theEvent.creator);
    }
    User.update({_id: user.id}, {rejectEventsResults: rejectEventsResults}).exec(function(err)
    {
        if (err){
        }
        else {}
    });
    return rejectEventsResults;
};


exports.initialRejectArray = function (user) {

    var rejectEventsResults;
    rejectEventsResults = {
        //"user": user,
        "day": new Array(7),
        "startTimeInHour": new Array(24),
        "duration": {
            "avg": 0,
            "length": 0
        },
        "minNumOfMembers": {
            "avg": 0,
            "length": 0
        },
        "maxNumOfMembers": {
            "avg": 0,
            "length": 0
        },
        "optNumOfMembers": {
            "avg": 0,
            "length": 0
        },
        "minAge": {
            "avg": 0,
            "length": 0
        },
        "maxAge": {
            "avg": 0,
            "length": 0
        },
        "forFemale": {
            "yes": 0,
            "no": 0
        },
        "forMale": {
            "yes": 0,
            "no": 0
        },
        "court": [],
        "groups": [],
        "sportType": [],
        "creator": []
    };

    User.update({_id: user.id}, {rejectEventsResults: rejectEventsResults}).exec(function(err)
    {
        if (err){
        }
        else {}
    });

    return rejectEventsResults;

};
/*

exports.rejectsAnalysis = function (user) {

    var minRejectEvtsForAnalyzing = 10;
    var numOfRejectEvts = user.myRejectedSportEvts.length;
    if(numOfRejectEvts > minRejectEvtsForAnalyzing)
    {
        var allDays = user.rejectEventsResults.day;
        var theDay;
        for(var i = 0; i < allDays.length; i++)
        {
            if(allDays[i] > 0.8*numOfRejectEvts)
            {
                theDay = i;
            }
        }
        var allHours = user.rejectEventsResults.startTimeInHour;
        var theHour;
        for(i = 0; i < allHours.length; i++)
        {
            if(allHours[i] > 0.7*numOfRejectEvts)
            {
                theHour = i;
            }
        }
        var femaleYes = user.rejectEventsResults.forFemale.yes;
        var femaleNo = user.rejectEventsResults.forFemale.no;
        var maleYes = user.rejectEventsResults.forMale.yes;
        var maleNo = user.rejectEventsResults.forMale.no;
        if(femaleYes > 0.9*numOfRejectEvts)
        {
            var theFemale = true;
        }
    }


};

*/




/*------------------------getOptimalTime-----------------------------*/
exports.getOptimalTime = function(theEvent)
{
    var options =
    {
        "startTime": 0,
        "endTime": 0,
        "evgPart":0
    };
    var listOfOptions = [];
    var allParticipants = theEvent.allParticipants;
    var minNumOfMembers = theEvent.minNumOfMembers;
    var maxNumOfMembers = theEvent.maxNumOfMembers;
    var optNumOfMembers = theEvent.optNumOfMembers;
    var minDuration = (theEvent.minDuration * theEvent.arrTimesSize)/24;
    var startTime = -1, endTime;
    var startTimeMin, endTimeMin;
    var startTimeMax, endTimeMax;
    var startTimeOpt, endTimeOpt;
    var sum = 0, i = 0;
    var finalArr = getFinalArr(theEvent);

    while (i < finalArr.length)
    {
        if(finalArr[i] >= minNumOfMembers)
        {
            if (startTime == -1)
            {
                startTime = i;
            }
            sum += finalArr[i];
            i++;
        }
        else if ((finalArr[i] < minNumOfMembers || i >= finalArr.length) && ((i-1 - startTime) >= minNumOfMembers))
        {
            endTime = i - 1;
            options.startTime = startTime;
            options.endTime = endTime;
            options.evgPart = sum / (endTime-startTime);
            listOfOptions.push(options);
            i = startTime + 1;
            startTime = -1;
            sum = 0;
        }
        else if ((finalArr[i] < minNumOfMembers) && ((i-1 - startTime) < minNumOfMembers))
        {
            i = startTime + 1;
            startTime = -1;
            sum = 0;
        }
    }

    return listOfOptions;


};

var getFinalArr = function(theEvent)
{
    var result = [];
    for(var i = 0; i < theEvent.arrTimesSize; i++)
    {
        result[i] = 0;
    }

    for(i = 0; i < theEvent.allParticipants.length; i++)
    {
        var theId = theEvent.allParticipants[i]._id;
        Notific.find({user: theId}, 'arrTimes').exec(function(err, arrTimes)
        {
            if (err) {
            }
            else {
                for (var j = 0; j < arrTimes.length; j++)
                {
                    if (arrTimes[j] == true)
                    {
                        result[j]++;
                    }
                }
            }
        });
    }
    return result;
};
