/**
 * Created by ZIV on 13/12/2016.
 */
var mongoose = require('mongoose'),
    googleMaps = require('../../app/controllers/googleMaps.server.controller'),
    sportEvt = require('../../app/controllers/sportEvts.server.controller'),
    notifics = require('../../app/controllers/notifics.server.controller'),
    SportEvt = mongoose.model('SportEvt'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User'),
    Notific = mongoose.model('Notific'),
    Court = mongoose.model('Court');


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

var checkIfUserIsRelevant = function (user, todayDay, tomorrowDay) {

    var relevantTimes = [];
    //console.info("user.favoriteTimes[0]: " + JSON.stringify(user.favoriteTimes[0]));

    for(var hoursIndex = 0; hoursIndex < user.favoriteTimes[0].favoriteHours.length; hoursIndex++)
    {
        var theTime = user.favoriteTimes[todayDay].favoriteHours[hoursIndex];
        if(theTime.isIn)
        {
            relevantTimes.push({
                "user": user,
                "day": todayDay,
                "time": theTime.timeAsString
            })
        }
        theTime = user.favoriteTimes[tomorrowDay].favoriteHours[hoursIndex];
        if(theTime.isIn)
        {
            relevantTimes.push({
                "user": user,
                "day": tomorrowDay,
                "time": theTime.timeAsString
            })
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
    var arrTimesTwoDays = matchingArrTimes(numberOfDays, sizeForDay, todayDate, tomorrowDate, todayDay, tomorrowDay);
    //console.info("arrTimesTwoDays: " + JSON.stringify(arrTimesTwoDays));
    SportEvt.find({$and: [{$or: [{dateEvtAsString: todayDate}, {dateEvtAsString: tomorrowDate}]}, {openForIndividuals: true}]},
        '_id dateEvtAsString startTimeAsString sportType startTimeInMin court allParticipantsAndNotific minNumOfMembers maxNumOfMembers optNumOfMembers')
        .sort('startTimeInMin').populate('sportTypes court allParticipantsAndNotific.theUser allParticipantsAndNotific.notific', 'title gpsLocation country city status suggestionStatus').exec(function(err, sportEvtTodayAndTomorrow)
    {
        if (err) {}
        else {
            //console.info("matchingArr: " + JSON.stringify(sportEvtTodayAndTomorrow) + " " + sportEvtTodayAndTomorrow.length);
            for(var eventIndex = 0; eventIndex < sportEvtTodayAndTomorrow.length; eventIndex++)
            {
                var currCounter = sportEvt.getCurrentCounter(sportEvtTodayAndTomorrow[eventIndex]);

                if(sportEvtTodayAndTomorrow[eventIndex].maxNumOfMembers == null || currCounter.in < sportEvtTodayAndTomorrow[eventIndex].maxNumOfMembers)
                {

                    var eventStartTimeAsString = sportEvtTodayAndTomorrow[eventIndex].startTimeAsString;
                    var eventDateAsString = sportEvtTodayAndTomorrow[eventIndex].dateEvtAsString;
                    for(var timeIndex = 0; timeIndex < arrTimesTwoDays.length; timeIndex++)
                    {
                        if(eventDateAsString == arrTimesTwoDays[timeIndex].theDate && eventStartTimeAsString == arrTimesTwoDays[timeIndex].timeAsString)
                        {
                            arrTimesTwoDays[timeIndex].relevantEvents.push(sportEvtTodayAndTomorrow[eventIndex])
                        }
                    }
                }
            }
            User.find({isSearched: true}, '_id gpsLocation favoriteTimes sportTypes radiusOfSearch country city username')
                .populate('sportTypes', 'title').exec(function(err, usersTodayAndTomorrow)
            {
                if (err) {}
                else {
                    //console.info("usersTodayAndTomorrow.length: " + usersTodayAndTomorrow.length);
                    for (var userIndex = 0; userIndex < usersTodayAndTomorrow.length; userIndex++)
                    {
                        var relevantTimesPerUser = checkIfUserIsRelevant(usersTodayAndTomorrow[userIndex] ,todayDay ,tomorrowDay);
                        for (var itemIndex = 0; itemIndex < relevantTimesPerUser.length; itemIndex++)
                        {
                            var userTime = relevantTimesPerUser[itemIndex].time;
                            var userDay = relevantTimesPerUser[itemIndex].day;
                            for (var timeIndex = 0; timeIndex < arrTimesTwoDays.length; timeIndex++)
                            {
                                if(userTime == arrTimesTwoDays[timeIndex].timeAsString && userDay == arrTimesTwoDays[timeIndex].theDay)
                                {

                                    arrTimesTwoDays[timeIndex].relevantUsers.push(relevantTimesPerUser[itemIndex])
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

exports.matchingUsersAndEvents = function (req, res) {


    getArrTimeOfEventsAndUsers(function (matchingArr) {

        var allSuggestions = [];
        //var optionsCounter = 0;

        for (var timesIndex = 0; timesIndex < matchingArr.length; timesIndex++)
        {
            //optionsCounter = optionsCounter + (matchingArr[timesIndex].relevantUsers.length * matchingArr[timesIndex].relevantEvents.length);
            for (var eventIndex = 0; eventIndex < matchingArr[timesIndex].relevantEvents.length; eventIndex++)
            {
                for (var userIndex = 0; userIndex < matchingArr[timesIndex].relevantUsers.length; userIndex++)
                {
                    //console.info("matchingArr: " + matchingArr[timesIndex].timeAsString + " relevantUsers: " + JSON.stringify(matchingArr[timesIndex].relevantUsers[userIndex].user.username));
                    var eventItem = matchingArr[timesIndex].relevantEvents[eventIndex];
                    var userItem = matchingArr[timesIndex].relevantUsers[userIndex];
                    if(userItem.user.country && eventItem.court.country && userItem.user.country == eventItem.court.country)
                    {
                        var isUserInEvent = userInEvent(userItem, eventItem);
                        if (!isUserInEvent && eventItem.sportType._id == userItem.user.sportTypes._id)
                        {
                            console.info("matchingArr: " + matchingArr[timesIndex].timeAsString + " relevantUsers: " + JSON.stringify(matchingArr[timesIndex].relevantUsers[userIndex].user.username));

                            if (userItem.user.radiusOfSearch && userItem.user.radiusOfSearch > 0)
                            {
                                console.info("here3");
                                var userLocation = userItem.user.gpsLocation;
                                var courtLocation = eventItem.court.gpsLocation;

                                googleMaps.getDistanceBetweenTwoAddresses(userItem, eventItem, userLocation, courtLocation,
                                    function (userItemNew, eventItemNew, distance)
                                {

                                    if (userItemNew.user.radiusOfSearch <= distance)
                                    {
                                        console.info("here4");
                                        //userItem.user.eventSuggestions
                                        //console.info("userItem.user._id: " + userItemNew.user._id);
                                        notifics.createEventSuggestionNotific(eventItemNew, userItemNew.user);
                                        allSuggestions.push({
                                            "user": userItemNew.user,
                                            "event": eventItemNew
                                        });
                                    }
                                });
                            }
                            else if (userItem.user.city && eventItem.court.city && userItem.user.city == eventItem.court.city)
                            {
                                console.info("here5");
                                //userItem.user.eventSuggestions
                                notifics.createEventSuggestionNotific(eventItem, userItem.user);
                                allSuggestions.push({
                                    "user": userItem.user,
                                    "event": eventItem
                                });
                            }
                            else if (!userItem.user.city) {
                                console.info("here6");
                                //add your city
                            }
                            else if (!userItem.court.city) {
                                console.info("here7");
                                //add your city
                            }
                        }
                        else if(!userInEvent) {
                            console.info("here8");
                            //suggest to try new sport
                        }

                    }
                    else if (!userItem.user.country) {
                        console.info("here9");
                        //add your country and city
                    }
                }
            }
        }
        console.info("res.json(allSuggestions);");
        res.json(allSuggestions);
    });
};

var userInEvent = function (userItem, eventItem) {

    for (var memberIndex = 0; memberIndex < eventItem.allParticipantsAndNotific.length; memberIndex++) {

        if (userItem.user._id == eventItem.allParticipantsAndNotific[memberIndex].theUser.id) {
            return true;
        }
    }
    return false;
};


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


/*------------------------search functions-----------------------------*/

exports.searchByCity = function(city, sportEvt)
{
    return city.toUpperCase() == sportEvt.court.city.toUpperCase();
};
exports.searchByRadius = function(radius, sportEvt)
{

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





function searchByCity(city, sportEvt)
{

}
function searchByRadius(radius, sportEvt)
{

}
function searchByMaxStartTime(maxStartTime, sportEvt)
{
    maxStartTime = (Number(maxStartTime.startTimeAsString.split(":")[0])*60
    + Number(maxStartTime.startTimeAsString.split(":")[1]));
}
function searchByMinStartTime(minStartTime, sportEvt)
{
    minStartTime = (Number(timeStart.startTimeAsString.split(":")[0])*60
    + Number(timeStart.startTimeAsString.split(":")[1]));

}
function searchByMaxMembers(maxMembers, sportEvt)
{

}
function searchByMinMembers(minMembers, sportEvt)
{

}
function searchByMaxAge(maxAge, sportEvt)
{

}
function searchByMinAge(minAge, sportEvt)
{

}
function searchByMale(sportEvt)
{

}
function searchByFemale(sportEvt)
{

}