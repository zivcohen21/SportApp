/**
 * Created by ZIV on 17/11/2016.
 */
angular.module('groups').controller('GroupsController',
    ['$scope', '$route', '$routeParams', '$location', 'Authentication', 'Groups', 'GetMyGroups', 'GetAllUsers',
        'AddUsersToGroup', 'AllUsersNotInGroup', 'UsersInGroup', 'RemoveUsersFromGroup',
        'GetAllSportTypes', 'GetAllCourts', 'GetSportEvtsOfGroup', 'GetMembers', 'JoinToGroup', 'AddRequestsToGroup',
        function($scope, $route, $routeParams, $location, Authentication, Groups, GetMyGroups, GetAllUsers,
                 AddUsersToGroup, AllUsersNotInGroup, UsersInGroup, RemoveUsersFromGroup, GetAllSportTypes,
                 GetAllCourts, GetSportEvtsOfGroup, GetMembers, JoinToGroup, AddRequestsToGroup)
        {
            $scope.selectedUsers = [];
            $scope.usersToRemove = [];
            $scope.usersToAdd = [];
            $scope.requestsToAdd = [];
            $scope.authentication = Authentication;
            $scope.groupSelected = null;
            $scope.eventListOpen = null;
            $scope.upcomingOrPast = 'Upcoming';
            $scope.searchKeyword = "";
            $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            $scope.inGroupPage = true;
            $scope.isSubmited = false;
            $scope.isShowUsers = false;
            $scope.checkboxModel = {
                femaleGroup : true,
                maleGroup : true
            };
            $scope.isSearched = true;

            $scope.create = function()
            {
                $scope.isSubmited = true;
                var allIds = getMultiSelection($scope.usersToAdd);
                allIds.push( $scope.authentication.user.id);
                //console.info("document.getElementById('image').value " + document.getElementById("image").value);
                var group = new Groups(
                {
                    title: document.getElementById("title").value,
                    members: allIds,
                    theSportType:  document.getElementById("sportType").value,
                    defaultCourt:  document.getElementById("court").value,
                    minAge: document.getElementById("minAgeGroup").value,
                    maxAge: document.getElementById("maxAgeGroup").value,
                    forFemale: $scope.checkboxModel.femaleGroup,
                    forMale: $scope.checkboxModel.maleGroup,
                    isSearched: document.getElementById("isSearched").value

                });

                group.$save(function(response)
                {

                    $location.path('groups/allGroups/' + response._id);
                },
                    function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.find = function()
            {
                $scope.menuSelection = 2;
                $scope.groups = Groups.query();
            };
            $scope.findOne = function(index)
            {
                $scope.adminSelection = index;
                $scope.getAllUsersSportTypesCourts(index);
                Groups.get({
                    groupId: $routeParams.groupId
                }).$promise.then(function (response) {

                    // console.info("response: " + JSON.stringify(response));
                    $scope.group = response;
                    $scope.theSportType = $scope.group.theSportType;
                    $scope.theCourt = $scope.group.defaultCourt;
                    $scope.sportEvts = $scope.group.sportEvts;
                    checkIfInGroup($scope.group);
                    console.info("findOne " + $routeParams.groupId);
                });
            };
            $scope.update = function()
            {
                $scope.isSubmited = true;
                console.info("group.forFemale " + $scope.group.forFemale);
                console.info("group.forMale " + $scope.group.forMale);
                $scope.group.$update(function()
                {
                    $location.path('groups/allGroups/' + $scope.group._id);
                },
                function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });
            };
            $scope.delete = function(group)
            {
                if (group)
                {
                    group.$remove(function()
                    {
                        for (var i in $scope.groups)
                        {
                            if ($scope.groups[i] === group)
                            {
                                $scope.groups.splice(i, 1);
                            }
                        }
                    });
                }
                else
                {
                    $scope.group.$remove(function()
                    {
                        $location.path('groups/myGroups');
                    });
                }
            };

            $scope.myGroups = function () {
                $scope.menuSelection = 1;
                $scope.myGroupsList = GetMyGroups.query({
                    userId: $scope.authentication.user.id
                });
            };

            $scope.allUsers = function () {
                $scope.usersList = GetAllUsers.query();
            };
            $scope.allUsersNotInGroup = function (index) {
                $scope.adminSelection = index;
                $scope.inGroupPage = false;
                Groups.get({
                    groupId: $routeParams.groupId
                }).$promise.then(function (response) {
                   // $scope.adminSelection = index;
                    // console.info("response: " + JSON.stringify(response));
                    $scope.group = response;
                    $scope.usersAskedToJoin = response.askedToJoin;
                    $scope.users = AllUsersNotInGroup.query({
                        groupId: $routeParams.groupId
                    });
                    checkIfInGroup($scope.group);
                });

            };

            $scope.usersInGroup = function () {
                $scope.adminSelection = 6;
                $scope.inGroupPage = false;
                $scope.users = [];
                Groups.get({
                    groupId: $routeParams.groupId
                }).$promise.then(function (response) {
                   // $scope.adminSelection = index;
                    // console.info("response: " + JSON.stringify(response));
                    $scope.group = response;
                    for(var i = 0; i < $scope.group.members.length; i++)
                    {
                        if($scope.group.members[i].id != $scope.authentication.user.id)
                        {
                            $scope.users.push($scope.group.members[i])
                        }
                    }
                    checkIfInGroup($scope.group);
                });

            };

            $scope.askToJoinToGroup = function () {

                var joinToGroup = new JoinToGroup({"groupId": $routeParams.groupId});
                joinToGroup.$save(function(response)
                    {
                        $route.reload();
                    },
                    function(errorResponse)
                    {
                        $scope.error = errorResponse.data.message;
                    });
            };

            $scope.addUsersToGroup = function () {

                $scope.isSubmited = true;
                var allIds = getMultiSelection($scope.usersToAdd);
                var newMembers = new AddUsersToGroup({"allIds": allIds, "groupId": $routeParams.groupId});
                newMembers.$save(function(response)
                {

                    $location.path('groups/allGroups/' + response._id);
                },
                function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });

            };

            $scope.addRequestsToGroup = function () {

                $scope.isSubmited = true;
                var requestsToAdd = getMultiSelection($scope.requestsToAdd);
                var newMembers = new AddRequestsToGroup({"requestsToAdd": requestsToAdd, "groupId": $routeParams.groupId});
                newMembers.$save(function(response)
                {

                    $location.path('groups/allGroups/' + response._id);

                },
                function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });

            };

            $scope.removeUsers = function () {

                $scope.isSubmited = true;
                var allIds = getMultiSelection($scope.usersToRemove);
                removeUsersFromGroup(allIds)
            };

            var removeUsersFromGroup = function (allIds) {

                $scope.isSubmited = true;
                var removeMembers = new RemoveUsersFromGroup({"allIds": allIds, "groupId": $routeParams.groupId});
                removeMembers.$save(function(response)
                    {
                        $location.path('groups/allGroups/' + response._id);
                        $route.reload();
                    },
                    function(errorResponse)
                    {
                        $scope.error = errorResponse.data.message;
                    });
            };

            var getMultiSelection = function (listOfUsers) {
                var allIds = [];
                for(var i in listOfUsers)
                {
                    allIds[i] = listOfUsers[i]._id;
                }
                return allIds;
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

            $scope.openGroup = function (group) {
                $scope.groupSelected = group;
                $location.path('groups/allGroups/' + group._id);
            };

            $scope.getAllUsersSportTypesCourts = function (index) {
                if(index == 3)
                    $scope.menuSelection = 3;
                $scope.users = GetAllUsers.query();
                $scope.courtList = GetAllCourts.query();
                $scope.sportTypeList = GetAllSportTypes.query();
            };
            $scope.goToPage = function (string, id) {
                $location.path(string + id);
            };

            $scope.openEventList  = function (group) {
                if ($scope.eventListOpen == null)
                {
                    $scope.eventListOpen = group._id;
                    GetSportEvtsOfGroup.query({
                        groupId: group._id
                    }).$promise.then(function (response) {
                        $scope.sportEvts = response;
                    });
                }
                else {
                    $scope.eventListOpen = null;
                }
            };

            $scope.oldNewEvents = function (upcomingOrPast) {
                $scope.upcomingOrPast = upcomingOrPast;
            };

            $scope.checkIfShow = function (sportEvt) {

                return ($scope.upcomingOrPast=='Upcoming' && sportEvt.isStarted==false) || ($scope.upcomingOrPast=='Past' && sportEvt.isStarted==true);
            };

            $scope.openEvent = function (sportEvt) {
                $scope.eventSelected = sportEvt;
                $location.path('sportEvts/' + sportEvt._id);
            };

            var getMembers = function (groupId, callback) {
                GetMembers.query({
                    groupId: groupId
                }).$promise.then(function (response) {
                    return callback(response[0]);
                });
            };

            var checkIfInGroup = function (group) {
                $scope.isInGroup = false;
                $scope.isInWaitingList = false;
                if($scope.authentication.user.id == group.creator.id) {
                    $scope.isInGroup = true;
                    $scope.isInWaitingList = false;
                }
                else
                {
                    for (var i = 0; i < group.members.length; i++)
                    {
                        if ($scope.authentication.user.id == group.members[i].id)
                        {
                            $scope.isInGroup = true;
                            break;
                        }
                    }
                    if(!$scope.isInGroup)
                    {
                        for (i = 0; i < group.askedToJoin.length; i++)
                        {
                            if ($scope.authentication.user.id == group.askedToJoin[i].id)
                            {
                                $scope.isInWaitingList = true;
                                break;
                            }
                        }
                    }

                }

            };

            $scope.addList = function (member)
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


            $scope.manageRemove = function (member)
            {
                $scope.index = $scope.usersToRemove.indexOf(member);
                console.info("index: " + $scope.index);
                if($scope.index !== -1){
                    $scope.usersToRemove.splice($scope.index, 1);
                }
                else if($scope.index == -1) {
                    $scope.usersToRemove.push(member);
                }
            };

            $scope.leaveGroup = function () {
                var removeUser = [];
                removeUser.push($scope.authentication.user.id);
                removeUsersFromGroup(removeUser)
            };
            $scope.showUsers = function () {
                $scope.isShowUsers = !$scope.isShowUsers;
            };
        }
    ]);
