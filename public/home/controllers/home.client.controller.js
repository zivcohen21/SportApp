/**
 * Created by ZIV on 16/11/2016.
 */
angular.module('home').controller('HomeController', ['$http','$scope', '$location', 'Authentication','GetMyNextSportEvts',
    'GetAllSportTypes', 'GetRelevantEvents', 'MatchingUsersAndEvents', 'GetMyNextFiveSportEvts', 'GetRelevantUsers',
    'GetRelevantGroups', 'GetRelevantCourts','SaveTimesHome', 'GetMySuggestions',
    function($http, $scope, $location, Authentication, GetMyNextSportEvts, GetAllSportTypes, GetRelevantEvents,
             MatchingUsersAndEvents, GetMyNextFiveSportEvts, GetRelevantUsers, GetRelevantGroups, GetRelevantCourts,
             SaveTimesHome, GetMySuggestions)
    {

        $scope.authentication = Authentication;
        $scope.editFavoriteTimes = false;
        $scope.isSearched = 0;
        $scope.showEventsForm = false;
        $scope.showUsersForm = false;
        $scope.showCourtsForm = false;
        $scope.showGroupsForm = false;
        $scope.showTimes = true;
        $scope.allDays = [];
        $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        $scope.currentModuleInApp = 'SportApp';
        localStorage.setItem("currentModule", $scope.currentModuleInApp);

        $scope.getHomePage = function () {
            if(!$scope.authentication.user.newUser )
            {
                $scope.theHomeSelection = 0;
                $scope.nextSportEvt = [];
                $scope.todaySportEvts = [];
                $scope.tomorrowSportEvts = [];

                var currTime = new Date();
                $scope.todayDate = currTime;
                $scope.todayDate = $scope.todayDate.toISOString().split('T')[0];
                var tomorrowDate = currTime;
                tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                tomorrowDate = tomorrowDate.toISOString().split('T')[0];
                /*GetMyNextSportEvts.query({ userId: $scope.authentication.user.id }).$promise.then(function (response) {
                 $scope.nextSportEvts = response;
                 divideMySportEvts(response, tomorrowDate)
                 });*/
                getMySuggestions();
                getMyNextSportEvts();
                userTimes();
            }
            else {
                $scope.authentication.user.newUser = false;
                $location.path('users/' + $scope.authentication.user.id + '/edit');
            }
        };

        var getMySuggestions = function () {

            GetMySuggestions.query({ userId: $scope.authentication.user.id }).$promise.then(function (response) {
                console.info("mySuggestions: " + response);
                $scope.mySuggestions = response;
            });
        };

        var getMyNextSportEvts = function () {

            GetMyNextFiveSportEvts.query({ userId: $scope.authentication.user.id }).$promise.then(function (response) {
                console.info("nextSportEvts: " + response);
                $scope.myNextFiveEvents = response;
                $scope.myNextSportEvts = $scope.myNextFiveEvents;
            });
        };

        $scope.searchAll = function (searchType) {

            if(searchType == "Events")
            {
                console.info("Events");
                getRelevantEvents(function (relevantEvents) {
                    $scope.isSearched = 1;
                    console.info("$scope.isSearched: " + $scope.isSearched);
                    $scope.sportEvts = relevantEvents;
                });
            }
            else if(searchType == "Users")
            {
                console.info("Users");
                getRelevantUsers(function (relevantUsers) {
                    $scope.isSearched = 2;
                    $scope.users = relevantUsers;
                });
            }
            else if(searchType == "Courts")
            {
                console.info("Courts");
                getRelevantCourts(function (relevantCourts) {
                    $scope.isSearched = 3;
                    $scope.courts = relevantCourts;
                });
            }
            else if(searchType == "Groups")
            {
                console.info("Groups");
                getRelevantGroups(function (relevantGroups) {
                    $scope.isSearched = 4;
                    $scope.groups = relevantGroups;
                });
            }
        };

        var getRelevantEvents = function (callback) {

            if(document.getElementById("sportTypeEvent").value && document.getElementById("dateEvtAsString").value)
            {
                var eventsDetails = {
                    userId: $scope.authentication.user._id,
                    sportType: document.getElementById("sportTypeEvent").value,
                    dateEvtAsString: document.getElementById("dateEvtAsString").value,
                    timeStart: document.getElementById("timeStart").value,
                    timeEnd: document.getElementById("timeEnd").value,
                    country: document.getElementById("countryEvent").value,
                    city: document.getElementById("cityEvent").value,
                    radius: $scope.radiusEvent.dozens,
                    minMembers: document.getElementById("minMembersEvent").value,
                    maxMembers: document.getElementById("maxMembersEvent").value,
                    minAge: document.getElementById("minAgeEvent").value,
                    maxAge: document.getElementById("maxAgeEvent").value,
                    female: $scope.checkboxModel.femaleEvent,
                    male: $scope.checkboxModel.maleEvent
                };
                GetRelevantEvents.searchEvents(
                    eventsDetails
                ).$promise.then(function (relevantEvents) {
                    console.info("relevantEvents: " + relevantEvents.length);
                    return callback(relevantEvents);
                });
            }
            else {
                return callback([])
            }

        };

        var getRelevantUsers = function (callback) {

            var usersDetails = {
                userId: $scope.authentication.user._id,
                sportType: document.getElementById("sportTypeUser").value,
                country: document.getElementById("countryUser").value,
                city: document.getElementById("cityUser").value,
                radius: $scope.radiusUser.dozens,
                minAge: document.getElementById("minAgeUser").value,
                maxAge: document.getElementById("maxAgeUser").value,
                female: $scope.checkboxModel.femaleUser,
                male: $scope.checkboxModel.maleUser
            };
            GetRelevantUsers.searchUsers(
                usersDetails
            ).$promise.then(function (relevantUsers) {
                console.info("relevantUsers: " + JSON.stringify(relevantUsers));
                return callback(relevantUsers);
            });
        };

        var getRelevantCourts = function (callback) {

            var courtsDetails = {
                userId: $scope.authentication.user._id,
                sportType: document.getElementById("sportTypeCourt").value,
                country: document.getElementById("countryCourt").value,
                city: document.getElementById("cityCourt").value,
                radius: $scope.radiusCourt.dozens
            };
            GetRelevantCourts.searchCourts(
                courtsDetails
            ).$promise.then(function (relevantCourts) {
                console.info("relevantCourts: " + JSON.stringify(relevantCourts));
                return callback(relevantCourts);
            });
        };

        var getRelevantGroups = function (callback) {

            var groupsDetails = {
                userId: $scope.authentication.user._id,
                sportType: document.getElementById("sportTypeGroup").value,
                country: document.getElementById("countryGroup").value,
                city: document.getElementById("cityGroup").value,
                radius: $scope.radiusEvent.dozens,
                minMembers: document.getElementById("minMembersGroup").value,
                maxMembers: document.getElementById("maxMembersGroup").value,
                minAge: document.getElementById("minAgeGroup").value,
                maxAge: document.getElementById("maxAgeGroup").value,
                female: $scope.checkboxModel.femaleGroup,
                male: $scope.checkboxModel.maleGroup
            };
            console.info("groupsDetails.sportType: " + JSON.stringify(groupsDetails.sportType));
            GetRelevantGroups.searchGroups(
                groupsDetails
            ).$promise.then(function (relevantGroups) {
                console.info("relevantGroups: " + JSON.stringify(relevantGroups));
                return callback(relevantGroups);
            });
        };

        $scope.homeSelection = function (index) {

            modelOfAllForms();
            //$scope.myNextSportEvts = $scope.myNextFiveEvents;
            if(index==1)
            {
                if($scope.isSearched != index)
                {
                    $scope.showEventsForm = !$scope.showEventsForm;
                }
                else {
                    $scope.showEventsForm = true;
                }
                $scope.isSearched = 0;
                $scope.showUsersForm = false;
                $scope.showCourtsForm = false;
                $scope.showGroupsForm = false;
                $scope.showTimes = false;
            }
            else if(index==2)
            {
                if($scope.isSearched != index)
                {
                    $scope.showUsersForm = !$scope.showUsersForm;
                }
                else {
                    $scope.showUsersForm = true;
                }
                $scope.isSearched = 0;
                $scope.showEventsForm = false;
                $scope.showCourtsForm = false;
                $scope.showGroupsForm = false;
                $scope.showTimes = false;
            }
            else if(index==3)
            {
                if($scope.isSearched != index)
                {
                    $scope.showCourtsForm = !$scope.showCourtsForm;
                }
                else {
                    $scope.showCourtsForm = true;
                }
                $scope.isSearched = 0;
                $scope.showUsersForm = false;
                $scope.showEventsForm = false;
                $scope.showGroupsForm = false;
                $scope.showTimes = false;
            }
            else if (index == 4)
            {
                if($scope.isSearched != index)
                {
                    $scope.showGroupsForm = !$scope.showGroupsForm;
                }
                else {
                    $scope.showGroupsForm = true;
                }
                $scope.isSearched = 0;
                $scope.showCourtsForm = false;
                $scope.showUsersForm = false;
                $scope.showEventsForm = false;
                $scope.showTimes = false;
            }

         /*  if(index==1)
            {
                $scope.myNextSportEvts = $scope.myNextFiveEvents;
            }
            else if(index==2)
            {
                console.info("$scope.todaySportEvts: " + $scope.todaySportEvts);
                $scope.myNextSportEvts = $scope.todaySportEvts;
            }
            else if(index==3)
            {
                $scope.myNextSportEvts = $scope.tomorrowSportEvts;
            }
            else if (index == 4 || index == 6) {
                modelOfAllForms();
            }*/
            else if(index == 5 && ($scope.authentication.user.role == 'Admin' || $scope.authentication.user.role == 'Owner')) {
                getAllSuggestions();
            }
            $scope.theHomeSelection = index;
        };

        var modelOfAllForms = function () {
            //$scope.isSearched = 0;
            $scope.radiusEvent = new Quantity(0);
            $scope.radiusCourt = new Quantity(0);
            $scope.radiusUser = new Quantity(0);
            $scope.radiusGroup = new Quantity(0);

            $scope.countryEvent = $scope.authentication.user.country;
            $scope.countryCourt = $scope.authentication.user.country;
            $scope.countryUser = $scope.authentication.user.country;
            $scope.countryGroup = $scope.authentication.user.country;

            $scope.cityEvent = $scope.authentication.user.city;
            $scope.cityCourt = $scope.authentication.user.city;
            $scope.cityUser = $scope.authentication.user.city;
            $scope.cityGroup = $scope.authentication.user.city;
            $scope.dateEvtAsString = $scope.todayDate;

            GetAllSportTypes.query(function (response) {
                $scope.sportTypeList = response;
                $scope.sportTypeEvent = $scope.sportTypeList[0];
                $scope.sportTypeUser = $scope.sportTypeList[0];
                $scope.sportTypeGroup = $scope.sportTypeList[0];
                $scope.sportTypeCourt = $scope.sportTypeList[0];
            });

            $scope.checkboxModel = {
                femaleEvent : true,
                maleEvent : true,
                femaleUser : true,
                maleUser : true,
                femaleGroup : true,
                maleGroup : true
            };


        };

        var divideMySportEvts = function (allNextEvts, tomorrowDate) {

            if (allNextEvts != null && allNextEvts.length > 0)
            {
                for (var i = 0; i < allNextEvts.length; i++)
                {
                    for (var j = 0; j < allNextEvts[i].allParticipantsAndNotific.length; j++)
                    {
                        if(allNextEvts[i].allParticipantsAndNotific[j].theUser && allNextEvts[i].allParticipantsAndNotific[j].notific && allNextEvts[i].allParticipantsAndNotific[j].theUser._id == $scope.authentication.user._id && allNextEvts[i].allParticipantsAndNotific[j].notific.status != 'Out')
                        {
                            if (allNextEvts[i].isStarted == false && ($scope.nextSportEvt.length == 0 || (allNextEvts[i].startTimeInMin < $scope.nextSportEvt.startTimeInMin)))
                            {
                                $scope.nextSportEvt[0] = allNextEvts[i];
                            }
                            if ($scope.todayDate.localeCompare(allNextEvts[i].dateEvtAsString) == 0) {
                                $scope.todaySportEvts.push(allNextEvts[i])
                            }
                            if (tomorrowDate.localeCompare(allNextEvts[i].dateEvtAsString) == 0) {
                                $scope.tomorrowSportEvts.push(allNextEvts[i])
                            }
                        }
                    }
                }
                $scope.myNextSportEvts = $scope.nextSportEvt;
            }
        };

        $scope.showHideTimes = function () {

            $scope.showTimes = !$scope.showTimes;
        };

        var userTimes = function () {
            $scope.getDateOfDay();
            var times = $scope.authentication.user.favoriteTimes;
            var start;
            for(var i = 0; i < times.length; i++)
            {
                var middle = false;
                var day = {
                    "dayByString": '',
                    "dayByNum": 0,
                    "date": '',
                    "range": []
                };
                var index = 38;
                for(var j = 0; j < times[i].favoriteHours.length; j++)
                {
                    if(index == times[i].favoriteHours.length)
                    {
                        index = 0;
                    }
                    var range = {
                        "start": '',
                        "end": ''
                    };

                    if(times[i].favoriteHours[index].isIn)
                    {
                        if(!middle)
                        {
                            start = times[i].favoriteHours[index].timeAsString;
                        }
                        middle = true;
                    }
                    else if(middle){
                        range.end = times[i].favoriteHours[index].timeAsString;
                        range.start = start;
                        middle = false;
                        day.range.push(range);
                    }
                    if(index == 37 && times[i].favoriteHours[index].isIn)
                    {
                        range.end = times[i].favoriteHours[index+1].timeAsString;
                        range.start = start;
                        middle = false;
                        day.range.push(range);
                    }


                    index++;
                }
                if(times[i].day == 's')
                {
                    day.dayByString = 'Sunday'
                }
                else if(times[i].day == 'm')
                {
                    day.dayByString = 'Monday'
                }
                else if(times[i].day == 't')
                {
                    day.dayByString = 'Tuesday'
                }
                else if(times[i].day == 'w')
                {
                    day.dayByString = 'Wednesday'
                }
                else if(times[i].day == 'th')
                {
                    day.dayByString = 'Thursday'
                }
                else if(times[i].day == 'f')
                {
                    day.dayByString = 'Friday'
                }
                else if(times[i].day == 'sa')
                {
                    day.dayByString = 'Saturday'
                }
                day.dayByNum = i;
                day.date = setDate(i);
                $scope.allDays.push(day);
            }
            console.info("$scope.allDays: " + JSON.stringify($scope.allDays));
        };

        var setDate = function(i)
        {
            var offset;
            var theDay = new Date().getDay();
            if(i < theDay)
            {
                offset = 7 - theDay + i;
            }
            else {
                offset = i - theDay;
            }
            console.info("offset: " + offset);
            var day = new Date();
            day.setDate(day.getDate()+offset);
            console.info("day: " + day);
            return day.toISOString().split('T')[0];
        };

        $scope.getDateOfDay = function()
        {


        };

        $scope.openForm = function () {

            $scope.isSearched = 0;
        };

        $scope.openEvent = function (sportEvt) {
            console.info("eventSelected1: " + $scope.eventSelected);
            $scope.eventSelected = sportEvt;
            $location.path('sportEvts/' + sportEvt._id);
            console.info("eventSelected2: " + $scope.eventSelected);

        };

        $scope.openUser = function (user) {
            console.info("eventSelected1: " + $scope.eventSelected);
            $scope.userSelected = user;
            $location.path('users/' + user._id);
            console.info("eventSelected2: " + $scope.eventSelected);

        };

        var getAllSuggestions = function () {

            MatchingUsersAndEvents.query().$promise.then(function (response) {
                $scope.allSuggestions = response;
                console.info("allSuggestions:" + $scope.allSuggestions.length);
            });
        };

        $scope.setFavoriteTimes = function () {

            if($scope.editFavoriteTimes == false)
            {
                console.info("1");
                $scope.editFavoriteTimes = true;
            }
            else {
                console.info("2");
                $scope.editFavoriteTimes = false;
            }
        };

        $scope.setDay = function (day) {
            $scope.theDay = day;
            console.info("$scope.theDay: " + $scope.theDay);
        };

        $scope.checkboxSet = function (day, time) {

            console.info("time: " + time);
            time.isIn = !time.isIn;

            var saveTimesHome = new SaveTimesHome({"timeIndex": time.index, "isIn": time.isIn,
                "day": day});
            saveTimesHome.$save(function()  {

                    var favoriteTimes = [];
                    var favoriteHours = [];
                    var offset = new Date().getTimezoneOffset();
                    console.info("offset: " + offset);
                    for (var i = 0; i < $scope.authentication.user.favoriteTimes.length; i++)
                    {
                        if($scope.authentication.user.favoriteTimes[i].day == day)
                        {
                            for (var j = 0; j < $scope.authentication.user.favoriteTimes[i].favoriteHours.length; j++)
                            {
                                if ($scope.authentication.user.favoriteTimes[i].favoriteHours[j].index == time.index)
                                {
                                    $scope.authentication.user.favoriteTimes[i].favoriteHours[j].isIn = time.isIn
                                }
                                favoriteHours[j] =
                                {
                                    "index": $scope.authentication.user.favoriteTimes[i].favoriteHours[j].index,
                                    "timeInMin": $scope.authentication.user.favoriteTimes[i].favoriteHours[j].timeInMin,
                                    "timeAsString": $scope.authentication.user.favoriteTimes[i].favoriteHours[j].timeAsString,
                                    "isIn": $scope.authentication.user.favoriteTimes[i].favoriteHours[j].isIn,
                                    "_id": $scope.authentication.user.favoriteTimes[i].favoriteHours[j]._id
                                }
                            }
                        }
                        favoriteTimes[i] =
                        {
                            "day": $scope.authentication.user.favoriteTimes[i].day,
                            "_id": $scope.authentication.user.favoriteTimes[i]._id,
                            "favoriteHours": favoriteHours
                        }
                    }
                    $scope.allDays = [];
                    userTimes();
                },
                function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });
        };

        $scope.checkIfShow = function (sportEvt) {

            return true;
        };


    }
]);

function Quantity(numOfPcs) {
    var divideNum = 10;
    var radius = numOfPcs;
    var dozens = numOfPcs / divideNum;

    this.__defineGetter__("radius", function () {
        return radius;
    });

    this.__defineSetter__("radius", function (val) {
        val = parseInt(val);
        radius = val;
        dozens = val / divideNum;
    });

    this.__defineGetter__("dozens", function () {
        return dozens;
    });

    this.__defineSetter__("dozens", function (val) {
        dozens = val;
        radius = val * divideNum;
    });
}

