/**
 * Created by ZIV on 27/11/2016.
 */
/*var localStorage = require('localStorage');*/
angular.module('courts').controller('CourtsController', ['$scope', '$http', '$routeParams', '$location', 'Authentication',
    'Courts',
    function($scope, $http, $routeParams, $location, Authentication, Courts)
    {
        $scope.authentication = Authentication;
        $scope.searchKeyword = "";
        $scope.isSubmited = false;
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
            $scope.court = Courts.get({ courtId: $routeParams.courtId });
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

    }
]);
