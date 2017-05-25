/**
 * Created by ZIV on 17/11/2016.
 */
angular.module('users').controller('UsersController',
    ['$scope', '$route', '$routeParams', '$location', 'Authentication', 'Users', 'EnterAddress', 'GetMyGroups', 'GetMySportEvts', 'GetAllSportTypes',
        function($scope, $route, $routeParams, $location, Authentication, Users, EnterAddress, GetMyGroups, GetMySportEvts, GetAllSportTypes)
        {
            $scope.authentication = Authentication;
            $scope.upcomingOrPast = 'Upcoming';
            $scope.eventListOpen = null;
            $scope.groupListOpen = null;
            $scope.eventGroupSelection = 0;
            $scope.editFavoriteTimes = false;
            $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

            $scope.find = function()
            {
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
                    GetAllSportTypes.query().$promise.then(function (response) {
                        $scope.sportTypeList = response;

                    });
                   /* $scope.theSportType = response.sportType;
                    $scope.theCourt = response.court;*/
                });
            };
            $scope.update = function()
            {
                $scope.user.$update(function()
                {
                    $location.path('users/' + $scope.user._id);
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
            };
            $scope.openGroup = function (group) {
                $scope.groupSelected = group;
                $location.path('groups/allGroups/' + group._id);
            };
            $scope.openEvent = function (sportEvt) {
                $scope.eventSelected = sportEvt;
                $location.path('sportEvts/' + sportEvt._id);
            };
            $scope.checkIfShow = function (sportEvt) {
                return ($scope.upcomingOrPast=='Upcoming' && sportEvt.isStarted==false) || ($scope.upcomingOrPast=='Past' && sportEvt.isStarted==true);
            };
            $scope.openGroupList  = function () {

                if ($scope.groupListOpen == null)
                {
                    $scope.eventGroupSelection = 1;
                    $scope.eventListOpen = null;
                    $scope.groupListOpen = $scope.authentication.user.id;
                    GetMyGroups.query().$promise.then(function (response) {
                        $scope.myGroupsList = response;
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
                    $scope.eventListOpen = $scope.authentication.user.id;
                    GetMySportEvts.query({
                        userId: $scope.authentication.user.id
                    }).$promise.then(function (response) {
                        $scope.mySportEvts = response;
                    });
                }
                else {
                    $scope.eventGroupSelection = 0;
                    $scope.eventListOpen = null;
                }
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
            };

            $scope.checkboxSet = function (day, time) {

                var favoriteTimes = [];
                var favoriteHours = [];

                for (var i = 0; i < $scope.user.favoriteTimes.length; i++)
                {
                    if($scope.user.favoriteTimes[i].day == day)
                    {
                        for (var j = 0; j < $scope.user.favoriteTimes[i].favoriteHours.length; j++)
                        {
                            if ($scope.user.favoriteTimes[i].favoriteHours[j].index == time.index)
                            {
                                $scope.user.favoriteTimes[i].favoriteHours[j].isIn = !$scope.user.favoriteTimes[i].favoriteHours[j].isIn;
                            }
                            favoriteHours[j] =
                            {
                                "index": $scope.user.favoriteTimes[i].favoriteHours[j].index,
                                "timeInMin": $scope.user.favoriteTimes[i].favoriteHours[j].timeInMin,
                                "timeAsString": $scope.user.favoriteTimes[i].favoriteHours[j].timeAsString,
                                "isIn": $scope.user.favoriteTimes[i].favoriteHours[j].isIn,
                                "_id": $scope.user.favoriteTimes[i].favoriteHours[j]._id
                            }
                        }
                    }
                    favoriteTimes[i] =
                    {
                        "day": $scope.user.favoriteTimes[i].day,
                        "_id": $scope.user.favoriteTimes[i]._id,
                        "favoriteHours": favoriteHours
                    }
                }

                //$scope.user.favoriteTimes = favoriteTimes;
                console.info("$scope.user.favoriteTimes: " + JSON.stringify(favoriteTimes));

            };

        }
    ]);