/**
 * Created by ZIV on 27/11/2016.
 */
angular.module('sportTypes').controller('SportTypesController', ['$scope', '$http', '$routeParams', '$location', 'Authentication', 'SportTypes',
    function($scope, $http, $routeParams, $location, Authentication, SportTypes)
    {
        $scope.authentication = Authentication;
        $scope.searchKeyword = "";
        $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        $scope.create = function()
        {
            var existing = isSportTypeExist(this.title);
            if(!existing)
            {
                var sportType = new SportTypes({
                    title: this.title
                });
                sportType.$save(function(response)
                 {
                 $location.path('sportTypes/' + response._id);
                 },
                 function(errorResponse)
                 {
                 $scope.error = errorResponse.data.message;
                 });
            }
            else {
                //Existing
            }
        };
        $scope.find = function(index)
        {
            $scope.menuSelection = index;
            $scope.sportTypes = SportTypes.query();
        };
        $scope.findOne = function()
        {
            $scope.sportType = SportTypes.get({ sportTypeId: $routeParams.sportTypeId });
        };
        $scope.update = function()
        {
            $scope.sportType.$update(function()
            {
                $location.path('sportTypes/' + $scope.sportType._id);
            },
            function(errorResponse)
            { $scope.error = errorResponse.data.message; });
        };
        $scope.delete = function(sportType)
        {
            if (sportType)
            {
                sportType.$remove(function()
                {
                    for (var i in $scope.sportTypes)
                    {
                        if ($scope.sportTypes[i] === sportType)
                        {
                            $scope.sportTypes.splice(i, 1);
                        }
                    }
                });
            }
            else
                {
                    $scope.sportType.$remove(function()
                    {
                        $location.path('sportTypes');
                    });
            }
        };

        $scope.sectionSelection = function (index, thePath) {
            $scope.menuSelection = index;
            $location.path(thePath);
            console.info("$scope.menuSelection: " + $scope.menuSelection);
        };

        $scope.adminSelect = function (index, thePath) {

            $scope.adminSelection = index;
            $location.path(thePath);
        };

        $scope.openSportPage = function (sportType) {
            $scope.sportTypeSelected = sportType;
            $location.path('sportTypes/' + sportType._id);
        };

        $scope.goToPage = function (string, id) {
            $location.path(string + id);
        };

        var isSportTypeExist = function (title)
        {
            for (var i = 0; i < $scope.sportTypes.length; i++)
            {
                if(title.toUpperCase() == $scope.sportTypes[i].title.toUpperCase())
                {
                    return true;
                }
            }
            return false;
        }
    }
]);
