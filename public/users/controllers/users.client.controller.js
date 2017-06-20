/**
 * Created by ZIV on 17/11/2016.
 */
angular.module('users').controller('UsersController',
    ['$scope', '$route', '$routeParams', '$location', 'Authentication', 'Users', 'EnterAddress', 'GetMyGroups', 'GetMySportEvts', 'GetAllSportTypes', 'UpdateRoleUser',
        function($scope, $route, $routeParams, $location, Authentication, Users, EnterAddress, GetMyGroups, GetMySportEvts, GetAllSportTypes, UpdateRoleUser)
        {
            $scope.authentication = Authentication;
            $scope.upcomingOrPast = 'Upcoming';
            $scope.eventListOpen = null;
            $scope.groupListOpen = null;
            $scope.eventGroupSelection = 0;
            $scope.eventsCounter = 0;
            $scope.editFavoriteTimes = false;
            $scope.sportsToAdd = [];
            $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

            $scope.find = function()
            {
                $scope.menuSelection = 2;
                $scope.users = Users.query();
            };
            $scope.findOne = function(index)
            {
                Users.get(
                {
                    userId: $routeParams.userId
                }).$promise.then(function (response) {
                    $scope.adminSelection = index;
                    // console.info("response: " + JSON.stringify(response));
                    $scope.user = response;
                    if($scope.authentication.user._id == $scope.user._id)
                    {
                        $scope.menuSelection = 1;
                    }
                    $scope.checkboxModel = {
                        userRole:  $scope.user.role
                    };
                    GetAllSportTypes.query().$promise.then(function (response) {
                        $scope.sportTypeList = response;
                        for(var i = 0; i < $scope.sportTypeList.length; i++)
                        {
                            for(var j = 0; j < $scope.user.sportTypes.length; j++)
                            {
                                if($scope.sportTypeList[i]._id == $scope.user.sportTypes[j]._id)
                                {
                                    $scope.addSportsList($scope.sportTypeList[i]);
                                }
                            }
                        }
                    });

                   /* $scope.theSportType = response.sportType;
                    $scope.theCourt = response.court;*/
                });
            };

            $scope.update = function()
            {
                $scope.user.sportTypes = getMultiSelection($scope.sportsToAdd);
                $scope.user.$update(function()
                    {
                        $location.path('users/' + $scope.user._id);
                    },
                    function(errorResponse)
                    {
                        $scope.error = errorResponse.data.message;
                    });
            };

            $scope.updateRoleUser = function () {

                $scope.user.role = $scope.checkboxModel.userRole;
                var updateRoleUser = new UpdateRoleUser({
                    "userId": $routeParams.userId,
                    "userRole": $scope.user.role
                });
                updateRoleUser.$save(function()
                {
                    $location.path('/users/' + $routeParams.userId);
                },
                function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });

            };

            $scope.delete = function(user)
            {
                if (user)
                {
                    user.$remove(function()
                    {
                        for (var i in $scope.user)
                        {
                            if ($scope.user[i] === user)
                            {
                                $scope.user.splice(i, 1);
                            }
                        }
                    });
                }
                else
                {
                    $scope.user.$remove(function()
                    {});
                }
            };

            $scope.adminSelect = function (index, thePath) {
                $scope.adminSelection = index;
                $location.path(thePath);
            };

            $scope.enterAddress = function()
            {
                var enterAddress = new EnterAddress({
                    "userId": $routeParams.userId,
                    "country": $scope.country,
                    "city": $scope.city,
                    "street": $scope.street,
                    "number": $scope.number
                });
                enterAddress.$save(function()
                {
                    $location.path('/users/' + $routeParams.userId);
                },
                function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.oldNewEvents = function (upcomingOrPast) {
                $scope.upcomingOrPast = upcomingOrPast;
                $scope.eventsCounter = 0;
            };
            $scope.checkIfShow = function (sportEvt) {

                var isShow = ($scope.upcomingOrPast=='Upcoming' && sportEvt.isStarted==false) || ($scope.upcomingOrPast=='Past' && sportEvt.isStarted==true);
                if(isShow)
                {
                    $scope.eventsCounter++;
                }
                console.info($scope.eventsCounter);
                return (isShow);
            };

            $scope.openGroup = function (group) {
                $scope.groupSelected = group;
                $location.path('groups/allGroups/' + group._id);
            };
            $scope.openEvent = function (sportEvt) {
                $scope.eventSelected = sportEvt;
                $location.path('sportEvts/' + sportEvt._id);
            };

            $scope.openGroupList  = function () {

                if ($scope.groupListOpen == null)
                {
                    $scope.eventGroupSelection = 1;
                    $scope.eventListOpen = null;
                    $scope.groupListOpen = $routeParams.userId;
                    GetMyGroups.query({
                        userId: $routeParams.userId
                    }).$promise.then(function (response) {
                        $scope.groups = response;
                    });
                }
                else {
                    $scope.eventGroupSelection = 0;
                    $scope.groupListOpen = null;
                }
            };
            $scope.openEventList = function () {
                if ($scope.eventListOpen == null)
                {
                    $scope.eventGroupSelection = 2;
                    $scope.groupListOpen = null;
                    $scope.eventListOpen = $routeParams.userId;
                    GetMySportEvts.query({
                        userId: $routeParams.userId
                    }).$promise.then(function (response) {
                        $scope.sportEvts = response;
                    });
                }
                else {
                    $scope.eventGroupSelection = 0;
                    $scope.eventListOpen = null;
                }
            };


            $scope.showSports = function () {
                $scope.isShowSports = !$scope.isShowSports;
            };
            $scope.addSportsList = function (sport)
            {
                $scope.index = $scope.sportsToAdd.indexOf(sport);
                console.info("index: " + $scope.index);
                if($scope.index !== -1){
                    $scope.sportsToAdd.splice($scope.index, 1);
                }
                else if($scope.index == -1) {
                    $scope.sportsToAdd.push(sport);
                }
            };

            var getMultiSelection = function (listOfUsers) {
                var allIds = [];
                for(var i in listOfUsers)
                {
                    allIds[i] = listOfUsers[i]._id;
                }
                return allIds;
            };
            $scope.goToPage = function (string, id) {
                $location.path(string + id);
            };

            $scope.sectionSelection = function (index, thePath) {
                $scope.menuSelection = index;
                $scope.eventSelected = null;
                $location.path(thePath);
            };

            $scope.selectUser = function (user) {
                $scope.userSelected = user;
                $location.path('users/' + user._id);
            };


        }
    ]);