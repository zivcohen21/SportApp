/**
 * Created by ZIV on 27/11/2016.
 */
angular.module('sportTypes').controller('SportTypesController', ['$scope', '$http', '$routeParams', '$location', 'Authentication', 'SportTypes',
    function($scope, $http, $routeParams, $location, Authentication, SportTypes)
    {
        $scope.authentication = Authentication;
        $scope.searchKeyword = "";
        $scope.isSubmited = false;
        $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        $scope.create = function()
        {

            var existing = isSportTypeExist(this.title);
            if(!existing)
            {
                $scope.isSubmited = true;

                var theTitle = this.title.replace(/ /g,'').toLowerCase();
                var iconString = "/images/" + theTitle + ".svg";
                var sportType = new SportTypes({
                    title: this.title,
                    icon: iconString
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
            $scope.sportType.icon = document.getElementById("icon").value;
            console.info("$scope.sportType.icon: " + $scope.sportType.icon);
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
            console.info("thePath: " + thePath);
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

        $scope.uploadFile = function(files) {
            var fd = new FormData();
            //Take the first selected file
            fd.append("file", files[0]);
            console.info("files[0]: " + JSON.stringify(files[0]));
            /*$http.post(uploadUrl, fd, {
                withCredentials: true,
                headers: {'Content-Type': undefined },
                transformRequest: angular.identity
            }).success( ...all right!... ).error( ..damn!... );
*/
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
