angular.module('sportEvts').controller('SportEvtsController', ['$scope', '$routeParams', '$route', '$location', 'Authentication',
    'SportEvts', 'GetAllCourts', 'GetGroupsCanBeAdded', 'GetMembers', 'GetAllUsers', 'GetAllSportTypes', 'GetMySportEvts',
    'SaveStatus', 'SaveTimes', 'GetAllMembersOfGroups', 'AllUsersNotInEvent', 'AllGroupsNotInEvent', 'AddUsersToEvent',
    'RemoveUsersFromEvent', 'JoinToEvent', 'AddUserRequestsToEvent',
        function($scope, $routeParams, $route, $location, Authentication, SportEvts, GetAllCourts, GetGroupsCanBeAdded, GetMembers,
                 GetAllUsers, GetAllSportTypes, GetMySportEvts, SaveStatus, SaveTimes, GetAllMembersOfGroups, AllUsersNotInEvent,
                 AllGroupsNotInEvent, AddUsersToEvent, RemoveUsersFromEvent, JoinToEvent, AddUserRequestsToEvent)
        {
            $scope.authentication = Authentication;
            $scope.upcomingOrPast = 'Upcoming';
            $scope.eventSelected = null;
            $scope.changingStatusOpen = null;
            $scope.myNotific = null;
            $scope.searchKeywordUsers = "";
            $scope.searchKeywordGroups = "";
            $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            $scope.selectedUsers = null;
            $scope.selectedGroups = null;
            $scope.usersToAdd = null;
            $scope.groupsToAdd = null;
            $scope.requestsToAdd = null;
            var usersInEvent = [];
            var groupsInEvent = [];
            $scope.usersToAdd = [];
            $scope.groupsToAdd = [];
            $scope.usersToRemove = [];
            $scope.groupsToRemove = [];
            $scope.requestsToAdd = [];
            $scope.inEventPage = true;
            $scope.isShowUsers = false;
            $scope.isShowGroups = false;
            $scope.checkboxModel = {
                femaleEvent : true,
                maleEvent : true
            };
            $scope.create = function()
            {
                $scope.eventSelected = null;

                var allGroups = getMultiSelection($scope.groupsToAdd);
                var allIds = getMultiSelection($scope.usersToAdd);
                var singleParticipants = [];
                var allParticipantsAndNotific = [];

                getMembers(allGroups, function (result) {
                    allIds.push($scope.authentication.user._id);
                    for (var i = 0; i < allIds.length; i++)
                    {
                        if(!isContain(result, allIds[i]))
                        {
                            singleParticipants.push(allIds[i]);
                            result.push(allIds[i]);
                        }
                    }
                    for (i = 0; i < result.length; i++)
                    {
                        var participantAndNotific =
                        {
                            "theUser": result[i],
                            "notific": null
                        };
                        allParticipantsAndNotific.push(participantAndNotific);
                    }

                    var sportEvt = new SportEvts({
                        dateEvt: document.getElementById("dateEvt").value,
                        dateEvtAsString: document.getElementById("dateEvt").value,
                        startTimeAsString: document.getElementById("startTimeAsString").value,
                        duration:  document.getElementById("duration").value,
                        minNumOfMembers: document.getElementById("minNumOfMembers").value,
                        maxNumOfMembers: document.getElementById("maxNumOfMembers").value,
                        optNumOfMembers: document.getElementById("optNumOfMembers").value,
                        minAge: document.getElementById("minAgeEvent").value,
                        maxAge: document.getElementById("maxAgeEvent").value,
                        forFemale: $scope.checkboxModel.femaleEvent,
                        forMale: $scope.checkboxModel.maleEvent,
                        openForIndividuals: $scope.openForIndividuals,
                        openForGroups: $scope.openForGroups,
                        sportType:  document.getElementById("sportType").value,
                        court:  document.getElementById("court").value,
                        groups: allGroups,
                        singleParticipants: singleParticipants,
                        allParticipantsAndNotific: allParticipantsAndNotific,
                        isStarted: false,
                        isEnded: false
                    });
                    console.info("sportEvt: " + JSON.stringify(sportEvt));
                    sportEvt.$save(function(response)
                    {
                        $location.path('sportEvts/' + response._id);
                    },
                    function(errorResponse) { $scope.error = errorResponse.data.message;
                    });
                });

            };
            $scope.find = function()
            {
                $scope.menuSelection = 2;
                $scope.eventSelected = null;
                $scope.sportEvts = SportEvts.query();
            };
            $scope.findOne = function(index)
            {

                SportEvts.get({ sportEvtId: $routeParams.sportEvtId }).$promise.then(function (response) {
                    $scope.adminSelection = index;
                   // console.info("response: " + JSON.stringify(response));
                    $scope.sportEvt = response;
                    $scope.theSportType = response.sportType;
                    $scope.theCourt = response.court;
                    currentCounterAndFindMyNotific(response);
                    checkIfInEvent($scope.sportEvt);
                });

                //currentCounter($scope.sportEvt);
                /*.$promise.then(function () {
                    CurrentCounter($scope.sportEvt);
                });*/
                //$scope.getCourtsMyGroupsUsersSportTypes();

            };

            $scope.findAndUpdate = function()
            {
                $scope.getCourtsMyGroupsUsersSportTypes(0);
                $scope.findOne(2);

            };

            $scope.update = function()
            {
                console.info("$scope.sportEvt: " + JSON.stringify($scope.sportEvt));
                $scope.sportEvt.$update(function()
                {
                    $location.path('sportEvts/' + $scope.sportEvt._id);
                }, function(errorResponse)
                { $scope.error = errorResponse.data.message;
                });
            };
            $scope.delete = function(sportEvt)
            {
                if (sportEvt)
                {
                    sportEvt.$remove(function()
                    {
                        for (var i in $scope.sportEvts)
                        {
                            if ($scope.sportEvts[i] === sportEvt)
                            {
                                $scope.sportEvts.splice(i, 1);
                            }
                        }
                    });
                }
                else
                { $scope.sportEvt.$remove(function()
                { $location.path('sportEvts/mySportEvts');
                });
                }
            };

            $scope.getCourtsMyGroupsUsersSportTypes = function (index) {
                $scope.menuSelection = index;
                $scope.courtList = GetAllCourts.query();
                $scope.groupList = getGroupsCanBeAdded();
                $scope.allUsersList = getAllUsers();
                $scope.sportTypeList = getAllSportTypes();
            };
            var getGroupsCanBeAdded = function () {
               return GetGroupsCanBeAdded.query();
            };
            var getMembers = function (allGroups, callback) {
                if(allGroups.length > 1)
                {
                    GetAllMembersOfGroups.getAllMembers({
                        allGroups: allGroups
                    }).$promise.then(function (allMembers) {
                        console.info("allMembers: " + JSON.stringify(allMembers[0].members));
                        return callback(allMembers[0].members);
                    });
                }
                else if(allGroups.length == 1)
                {
                    GetMembers.query({
                        groupId: allGroups
                    }).$promise.then(function (allMembers) {
                        console.info("allMembers: " + JSON.stringify(allMembers[0].members));
                        return callback(allMembers[0].members);
                    });
                }
                else{
                    return callback([]);
                }

            };

            $scope.getMySportEvts = function()
            {
                console.info("here1");
                $scope.menuSelection = 1;
                $scope.eventSelected = null;
                GetMySportEvts.query({ userId: $scope.authentication.user.id }).$promise.then(function (response) {
                    $scope.mySportEvts = response;
                    console.info("here4");
                });


            };

            var getAllUsers = function () {
                return GetAllUsers.query();
            };
            var getAllSportTypes = function () {
                return GetAllSportTypes.query();
            };
            var getMultiSelection = function (listOfUsers) {
                var allIds = [];
                for(var i in listOfUsers)
                {
                    allIds[i] = listOfUsers[i]._id;
                }
                return allIds;
            };

            var isContain = function (arr, item) {
                for (var i in arr) {
                    if ( JSON.stringify(arr[i]) === JSON.stringify(item)) return true;
                }
                return false;
            };

            $scope.sectionSelection = function (index, thePath) {
                $scope.menuSelection = index;
                $scope.eventSelected = null;
                $location.path(thePath);
            };

            $scope.adminSelect = function (index, thePath) {
                $scope.adminSelection = index;
                $location.path(thePath);
            };

            $scope.oldNewEvents = function (upcomingOrPast) {
                $scope.upcomingOrPast = upcomingOrPast;

            };

            $scope.openEvent = function (sportEvt) {
            console.info("eventSelected1: " + $scope.eventSelected);
            $scope.eventSelected = sportEvt;
            $location.path('sportEvts/' + sportEvt._id);
            console.info("eventSelected2: " + $scope.eventSelected);

            };

            $scope.checkIfShow = function (sportEvt) {

                return ($scope.upcomingOrPast=='Upcoming' && sportEvt.isStarted==false) || ($scope.upcomingOrPast=='Past' && sportEvt.isStarted==true);
             };

            $scope.goToPage = function (string, id) {
            $location.path(string + id);
            };

            var currentCounterAndFindMyNotific = function (sportEvt) {
                $scope.selectedUsers = [];
                $scope.minPercent = 0;
                $scope.maxPercent = 0;
                $scope.noAnswerCounter = 0;
                $scope.inCounter = 0;
                $scope.outCounter = 0;
                $scope.maybeCounter = 0;
                $scope.proposeAnotherTimeCounter = 0;
                var allList = sportEvt.allParticipantsAndNotific;
                for (var i in allList)
                {
                    $scope.selectedUsers.push(allList[i].theUser.username);

                    if(allList[i].notific.status == 'No Answer') { $scope.noAnswerCounter+=1; }
                    else if(allList[i].notific.status == 'In') { $scope.inCounter+=1; }
                    else if(allList[i].notific.status == 'Out') { $scope.outCounter+=1; }
                    else if(allList[i].notific.status == 'Maybe') { $scope.maybeCounter+=1; }
                    else if(allList[i].notific.status == 'Propose Another Time') { $scope.proposeAnotherTimeCounter+=1;}

                    if(allList[i].theUser.id == $scope.authentication.user.id)
                    {
                        $scope.myNotific = allList[i].notific;
                    }
                }
                if(sportEvt.minNumOfMembers >= 1 && sportEvt.maxNumOfMembers >= 1)
                {
                    $scope.minPercent = ($scope.inCounter / sportEvt.minNumOfMembers) * 100;
                    $scope.maxPercent = ($scope.inCounter / sportEvt.maxNumOfMembers) * 100;
                }
                $scope.listLength = parseInt(i)+1;

            };

            $scope.openMyStatus = function (sportEvt) {

                if($scope.changingStatusOpen != null)
                {
                    $scope.changingStatusOpen = null;
                }
                else{
                    $scope.changingStatusOpen = sportEvt._id;
                }

            };

            $scope.setStatus = function (sportEvt, myNotific, status) {

                myNotific.status = status;
                console.info("status: " + status);
                currentCounterAndFindMyNotific(sportEvt);
                var saveStatus = new SaveStatus({"status": status,
                    "notificId": myNotific._id,
                    "notificType": 'inviteToEvent'});
                saveStatus.$save(function()  {},
                    function(errorResponse)
                    {
                        $scope.error = errorResponse.data.message;
                    });
            };

            $scope.checkboxSet = function (sportEvt, notific, time) {

                console.info("time.isIn1: " + time.isIn);
                if (notific.status == 'Propose Another Time')
                {
                    time.isIn = !time.isIn;

                    var saveTimes = new SaveTimes({"timeIndex": time.index, "isIn": time.isIn,
                        "notificId": notific._id});
                    saveTimes.$save(function()  {},
                        function(errorResponse)
                        {
                            $scope.error = errorResponse.data.message;
                        });

                }
                console.info("time.isIn2: " + time.isIn);
            };

            var checkIfInEvent = function (sportEvt) {
                $scope.isInEvent = false;
                $scope.isInWaitingList = false;
                console.info("$scope.isInEvent1: " + $scope.isInEvent);
                if($scope.authentication.user._id == sportEvt.creator._id) {
                    $scope.isInEvent = true;
                    $scope.isInWaitingList = false;
                }

                else
                {
                    console.info("$scope.isInEvent2: " + $scope.isInEvent);
                    for (var i = 0; i < sportEvt.allParticipantsAndNotific.length; i++)
                    {
                        if ($scope.authentication.user.id == sportEvt.allParticipantsAndNotific[i].theUser._id)
                        {
                            $scope.isInEvent = true;
                            break;
                        }
                    }
                    console.info("$scope.isInEvent3: " + $scope.isInEvent);
                    if(!$scope.isInEvent)
                    {
                        for (i = 0; i < sportEvt.askedToJoin.length; i++)
                        {
                            if ($scope.authentication.user.id == sportEvt.askedToJoin[i].id)
                            {
                                $scope.isInWaitingList = true;
                                break;
                            }
                        }
                    }
                }

            };

            $scope.allUsersAndGroupsNotInEvent = function () {
                $scope.inEventPage = false;
                $scope.adminSelection = 5;
                SportEvts.get({
                    sportEvtId: $routeParams.sportEvtId
                }).$promise.then(function (response) {
                    $scope.sportEvt = response;
                    $scope.usersAskedToJoin = response.askedToJoin;
                    for (var i = 0; i < response.allParticipantsAndNotific.length; i++)
                    {
                        usersInEvent.push(response.allParticipantsAndNotific[i].theUser.id);
                    }
                    AllUsersNotInEvent.getUsersNotInEvent({
                        usersInEvent: usersInEvent,
                        usersInEventLength : usersInEvent.length
                    }).$promise.then(function (usersNotInEvent) {
                        $scope.usersNotInEvent = usersNotInEvent;
                    });
                    for (var i = 0; i < response.groups.length; i++)
                    {
                        groupsInEvent.push(response.groups[i]._id);
                    }
                    AllGroupsNotInEvent.getGroupsNotInEvent({
                        groupsInEvent: groupsInEvent,
                        groupsInEventLength : groupsInEvent.length
                    }).$promise.then(function (groupsNotInEvent) {
                        $scope.groupsNotInEvent = groupsNotInEvent;
                    });

                    checkIfInEvent($scope.sportEvt)
                });
            };

            $scope.addUsersAndGroupsToEvent = function () {

                var singleParticipants = [];
                var newParticipants = [];
                var listUsersToAdd = getMultiSelection($scope.usersToAdd);
                var listGroupsToAdd = getMultiSelection($scope.groupsToAdd);
                getMembers(listGroupsToAdd, function (result)
                {
                    for (i = 0; i < result.length; i++)
                    {
                        if(!isContain(usersInEvent, result[i]))
                        {
                            newParticipants.push(result[i]);
                        }
                    }
                    for (var i = 0; i < listUsersToAdd.length; i++)
                    {
                        if(!isContain(newParticipants, listUsersToAdd[i]))
                        {
                            singleParticipants.push(listUsersToAdd[i]);
                            newParticipants.push(listUsersToAdd[i]);
                        }
                    }
                    for (var i = 0; i < newParticipants.length; i++)
                    {
                        if(isContain(usersInEvent, newParticipants[i]))
                        {
                            var newParticipant = newParticipants[i];
                            newParticipants.pull(newParticipant)
                        }
                        if(newParticipant in singleParticipants)
                        {
                            singleParticipants.pull(newParticipant)
                        }
                    }
                    var newMembers = new AddUsersToEvent({
                        "singleParticipants": singleParticipants,
                        "newParticipants": newParticipants,
                        "listGroupsToAdd": listGroupsToAdd,
                        "sportEvtId": $routeParams.sportEvtId
                    });
                    newMembers.$save(function(response)
                    {
                        $location.path('sportEvts/' + response._id);
                    },
                    function(errorResponse)
                    {
                        $scope.error = errorResponse.data.message;
                    });
                });

            };

            $scope.addUserRequestsToEvent = function () {

                var requestsToAdd = getMultiSelection($scope.requestsToAdd);

                var newMembers = new AddUserRequestsToEvent({
                    "requestsToAdd": requestsToAdd,
                    "sportEvtId": $routeParams.sportEvtId
                });
                newMembers.$save(function(response)
                {
                    $location.path('sportEvts/' + response._id);
                },
                function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });


            };


            $scope.usersAndGroupsInEvent = function () {
                $scope.inEventPage = false;
                SportEvts.get({
                    sportEvtId: $routeParams.sportEvtId
                }).$promise.then(function (response) {
                    $scope.sportEvt = response;
                    $scope.usersListInEvent = response.allParticipantsAndNotific;
                    $scope.groupsListInEvent = response.groups;
                    checkIfInEvent($scope.sportEvt);
                });
            };


            $scope.removeUsersAndGroupsFromGroup = function () {

                var usersToRemove = getMultiSelection($scope.usersToRemove);
                var groupsToRemove = getMultiSelection($scope.groupsToRemove);
                console.info("usersToRemove: " + usersToRemove);
                var removeMembers = new RemoveUsersFromEvent({
                    "usersToRemove": usersToRemove,
                    "groupsToRemove": groupsToRemove,
                    "sportEvtId": $routeParams.sportEvtId
                });
                removeMembers.$save(function(response)
                {
                    $location.path('sportEvts/' + response._id);
                },
                function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.askToJoinToEvent = function () {

                var joinToEvent = new JoinToEvent({"sportEvtId": $routeParams.sportEvtId});
                joinToEvent.$save(function(response)
                {
                    $route.reload();
                },
                function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.addUsersList = function (member)
            {
                $scope.index = $scope.usersToAdd.indexOf(member);
                console.info("index: " + $scope.index);
                if($scope.index !== -1){
                    $scope.usersToAdd.splice($scope.index, 1);
                }
                else if($scope.index == -1) {
                    $scope.usersToAdd.push(member);
                }
            };

            $scope.addGroupsList = function (group)
            {
                $scope.index = $scope.groupsToAdd.indexOf(group);
                console.info("index: " + $scope.index);
                if($scope.index !== -1){
                    $scope.groupsToAdd.splice($scope.index, 1);
                }
                else if($scope.index == -1) {
                    $scope.groupsToAdd.push(group);
                }
            };

            $scope.requestsList = function (member)
            {
                $scope.index = $scope.requestsToAdd.indexOf(member);
                console.info("index: " + $scope.index);
                if($scope.index !== -1){
                    $scope.requestsToAdd.splice($scope.index, 1);
                }
                else if($scope.index == -1) {
                    $scope.requestsToAdd.push(member);
                }
            };

            $scope.removeUsersList = function (member) {
                $scope.index = $scope.usersToRemove.indexOf(member);
                console.info("index: " + $scope.index);
                if($scope.index !== -1){
                    $scope.usersToRemove.splice($scope.index, 1);
                }
                else if($scope.index == -1) {
                    $scope.usersToRemove.push(member);
                }
            };

            $scope.removeGroupsList = function (group) {
                $scope.index = $scope.groupsToRemove.indexOf(group);
                console.info("index: " + $scope.index);
                if($scope.index !== -1){
                    $scope.groupsToRemove.splice($scope.index, 1);
                }
                else if($scope.index == -1) {
                    $scope.groupsToRemove.push(group);
                }
            };
            
            $scope.showUsers = function () {
                $scope.isShowUsers = !$scope.isShowUsers;
            };
            $scope.showGroups = function () {
                $scope.isShowGroups = !$scope.isShowGroups;
            };

} ]);
