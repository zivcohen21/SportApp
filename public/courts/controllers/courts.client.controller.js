/**
 * Created by ZIV on 27/11/2016.
 */
/*var localStorage = require('localStorage');*/
angular.module('courts').controller('CourtsController', ['$scope', '$http', '$routeParams', '$location', 'Authentication',
    'Courts', 'getGroupsEventsUsersInCourt',
    function($scope, $http, $routeParams, $location, Authentication, Courts, getGroupsEventsUsersInCourt)
    {
        $scope.authentication = Authentication;
        $scope.searchKeyword = "";
        $scope.isSubmited = false;
        $scope.hereSelection = 0;
        $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        $scope.create = function()
        {
            $scope.isSubmited = true;
            var court = new Courts({
                title: this.title,
                country: this.country,
                city: this.city,
                street: this.street,
                number: this.number,
                GPSLocation: this.GPSLocation,
                sportTypesNumCourts: this.sportTypesNumCourts
                

            });
            court.$save(function(response)
            {
                $location.path('courts/' + response._id);
            },
            function(errorResponse)
            {
                $scope.error = errorResponse.data.message;
            });
        };
        $scope.find = function()
        {
            $scope.menuSelection = 1;
            Courts.query().$promise.then(function (response) {
                $scope.courts = response;
                console.info("$scope.courts: " + JSON.stringify($scope.courts));
            });
        };
        $scope.findOne = function()
        {
            $scope.groups = [];
            $scope.users = [];
            $scope.court = Courts.get({ courtId: $routeParams.courtId });
            getGroupsEventsUsersInCourt.query({ courtId: $routeParams.courtId }).$promise.then(function (response) {
                $scope.sportEvts = response;
                for(var i = 0; i < response.length; i++)
                {
                    for(var g = 0; g < response[i].groups.length; g++)
                    {
                        if(!isContain($scope.groups, response[i].groups[g]))
                        {
                            $scope.groups.push(response[i].groups[g]);
                        }
                    }
                    for(var u = 0; u < response[i].allParticipantsAndNotific.length; u++)
                    {
                        if(!isContain($scope.users, response[i].allParticipantsAndNotific[u].theUser))
                        {
                            $scope.users.push(response[i].allParticipantsAndNotific[u].theUser);
                        }
                    }
                }
                console.info("$scope.sportEvts: " + JSON.stringify($scope.sportEvts));
                console.info("$scope.groups: " + JSON.stringify($scope.groups));
                console.info("$scope.UsersInCourt: " + JSON.stringify($scope.users));
            });
        };
        $scope.update = function()
        {
            $scope.isSubmited = true;
            $scope.court.$update(function()
            {
                $location.path('courts/' + $scope.court._id);
            },
            function(errorResponse)
            { $scope.error = errorResponse.data.message; });
        };
        $scope.delete = function(court)
        {
            if (court)
            {
                court.$remove(function()
                {
                    for (var i in $scope.courts)
                    {
                        if ($scope.courts[i] === court)
                        {
                            $scope.courts.splice(i, 1);
                        }
                    }
                });
            }
            else
                {
                    $scope.court.$remove(function()
                    {
                        $location.path('courts');
                    });
            }
        };

        $scope.newCourtForm = function () {
            $scope.menuSelection = 2;
        };

        $scope.sectionSelection = function (index, thePath) {
            $location.path(thePath);
            $scope.menuSelection = index;
            console.info("$scope.menuSelection: " + $scope.menuSelection);
        };

        $scope.adminSelect = function (index, thePath) {

            $scope.adminSelection = index;
            $location.path(thePath);
        };

        $scope.openCourt = function (court) {
            $scope.courtSelected = court;
            $location.path('courts/' + court._id);
        };

        $scope.goToPage = function (string, id) {
            $location.path(string + id);
        };
        var isContain = function (arr, item) {
            for (var i in arr) {
                if ( JSON.stringify(arr[i]) === JSON.stringify(item)) return true;
            }
            return false;
        };

        $scope.openHereList = function (index) {
            $scope.hereSelection = index;
        };
        $scope.checkIfShow = function (sportEvt) {

           return true;
        };
    }
]);
