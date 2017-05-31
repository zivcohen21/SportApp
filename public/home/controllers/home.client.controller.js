/**
 * Created by ZIV on 16/11/2016.
 */
angular.module('home').controller('HomeController', ['$http','$scope', '$location', 'Authentication','GetMyNextSportEvts',
    'GetAllSportTypes', 'GetRelevantEvents', 'MatchingUsersAndEvents', 'GetMyNextFiveSportEvts', 'GetRelevantUsers',
    function($http, $scope, $location, Authentication, GetMyNextSportEvts, GetAllSportTypes, GetRelevantEvents,
             MatchingUsersAndEvents, GetMyNextFiveSportEvts, GetRelevantUsers)
    {

        $scope.authentication = Authentication;
        $scope.isSearched = false;
        $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        $scope.showOne = function (currentModule){

            $scope.currentModuleInApp = currentModule;

        };


        $scope.getMyNextSportEvts = function () {
            $scope.theHomeSelection = 1;
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
                    $scope.isSearched = true;
                    $scope.relevantEvents = relevantEvents;
                });
            }
            else if(searchType == "Users")
            {
                console.info("Users");
                getRelevantUsers(function (relevantUsers) {
                    $scope.isSearched = true;
                    $scope.relevantUsers = relevantUsers;
                });
            }
/*            else if(searchType == "Groups")
            {
                console.info("Groups");
                getGroupsDetails();
            }
            else if(searchType == "Courts")
            {
                console.info("Courts");
                getCourtsDetails();
            }*/
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
                    console.info("relevantEvents: " + JSON.stringify(relevantEvents));
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

        $scope.homeSelection = function (index) {
            $scope.theHomeSelection = index;

            if(index==1)
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
            }
            else if(index == 5) {
                suggestions();
            }
        };

        var modelOfAllForms = function () {
            $scope.isSearched = false;
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
            });

            $scope.checkboxModel = {
                femaleEvent : true,
                maleEvent : true,
                femaleUser : true,
                maleUser : true
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

        $scope.openForm = function () {

            $scope.isSearched = false;
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

        var suggestions = function () {

            MatchingUsersAndEvents.query().$promise.then(function (response) {
                $scope.allSuggestions = response;
                console.info("allSuggestions:" + JSON.stringify($scope.allSuggestions));
            });

        };



        var changeClass = function (r,className1,className2) {
            var regex = new RegExp("(?:^|\\s+)" + className1 + "(?:\\s+|$)");
            if( regex.test(r.className) ) {
                r.className = r.className.replace(regex,' '+className2+' ');
            }
            else{
                r.className = r.className.replace(new RegExp("(?:^|\\s+)" + className2 + "(?:\\s+|$)"),' '+className1+' ');
            }
            return r.className;
        };

        //  Creating our button in JS for smaller screens
       // var menuElements = document.getElementById('mainMenu');
       // menuElements.insertAdjacentHTML('afterBegin','<button type="button" id="menutoggle" class="navtoogle" aria-hidden="true"><i aria-hidden="true" class="icon-menu"> </i> Menu</button>');

        //  Toggle the class on click to show / hide the menu
        document.getElementById('menutoggle').onclick = function() {
            changeClass(this, 'navtoogle active', 'navtoogle');
        };

        // http://tympanus.net/codrops/2013/05/08/responsive-retina-ready-menu/comment-page-2/#comment-438918
        document.onclick = function(e) {
            var mobileButton = document.getElementById('menutoggle'),
                buttonStyle =  mobileButton.currentStyle ? mobileButton.currentStyle.display : getComputedStyle(mobileButton, null).display;

            if(buttonStyle === 'block' && e.target !== mobileButton && new RegExp(' ' + 'active' + ' ').test(' ' + mobileButton.className + ' ')) {
                changeClass(mobileButton, 'navtoogle active', 'navtoogle');
            }
        }

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

