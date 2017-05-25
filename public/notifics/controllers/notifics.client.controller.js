/**
 * Created by ZIV on 27/11/2016.
 */
angular.module('notifics').controller('NotificsController', ['$scope', '$route', '$http', '$routeParams', '$location',
    'Authentication', 'Notifics','GetMyNewNotifics','GetMyOldNotifics','SaveStatus','SaveTimes','GetMyNotifics', 'RemoveNotifics',
    'UpdateField',
    function($scope, $route, $http, $routeParams, $location, Authentication, Notifics, GetMyNewNotifics,
             GetMyOldNotifics, SaveStatus, SaveTimes, GetMyNotifics, RemoveNotifics, UpdateField)
    {
        $scope.authentication = Authentication;
        $scope.inTimes = [];
        $scope.isOpen = null;
        $scope.allTimes = [];
        $scope.isStatusSelected = false;
        $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        $scope.create = function()
        {
            var notific = new Notifics({

            });
            notific.$save(function(response)
            {
                $location.path('.../notifics/' + response._id);
            },
            function(errorResponse)
            {
                $scope.error = errorResponse.data.message;
            });
        };
       /* $scope.find = function()
        {
            $scope.notifics = Notifics.query();
        };
        $scope.findOne = function()
        {
            Notifics.get({ notificId: $routeParams.notificId }).$promise.then(function (response) {
                $scope.notific = response;
                $scope.allTimes = response.arrTimes;
            });
            $scope.showSelectValue = function(mySelect) {
                $scope.status = mySelect;
            }

        };*/
        $scope.update = function()
        {
            $scope.notific.$update(function()
            {
                $location.path('../notifics/' + $scope.notific._id);
            },
            function(errorResponse)
            { $scope.error = errorResponse.data.message; });
        };
        $scope.delete = function(notificId)
        {
            console.info($scope.authentication.user.id);
            RemoveNotifics.removeNot({ notificId: notificId }).$promise.then(function () {
                $route.reload();
            });

            /*if (notific)
            {
                notific.$remove(function()
                {
                    for (var i in $scope.notifics)
                    {
                        if ($scope.notifics[i] === notific)
                        {
                            $scope.notifics.splice(i, 1);
                        }
                    }
                });
            }
            else
                {
                    $scope.notific.$remove(function()
                    {
                        $location.path('notifics');
                    });
            }*/
        };

        $scope.getMyNotifics = function()
        {
            $scope.myNotifics = GetMyNotifics.query({ userId: $routeParams.userId });
 /*         $scope.newNotifics = GetMyNewNotifics.query({ userId: $routeParams.userId });
            $scope.oldNotifics = GetMyOldNotifics.query({ userId: $routeParams.userId });*/

        };

       /* $scope.saveStatusAndTimes = function()
        {
            var userStatus = document.getElementById("status").value;
            var checkBoxList = null;
            if (userStatus == "setTimes")
            {
                checkBoxList = $scope.inTimes;
            }
            console.info("checkBoxList: " + checkBoxList);
            var saveStatusAndTimes = new SaveStatusAndTimes({"status": userStatus,
                "notificId": $routeParams.notificId, "checkBoxList": checkBoxList});
            saveStatusAndTimes.$save(function(response)
            {
                console.info("response: " + response);
                $location.path('sportEvts/' + $scope.notific.theEvent._id);
            },
            function(errorResponse)
            {
                $scope.error = errorResponse.data.message;
            });
        };*/

        $scope.replyToggle = function (notific) {

            console.info("notific.status: " + notific.status);
           // if((smallSize && $scope.windWidth <= 575) || (!smallSize && $scope.windWidth > 575)) {
                if ($scope.isOpen == notific._id) {
                    $scope.isOpen = null;
                    // $scope.isStatusSelected = false;

                }
                else {
                    $scope.isOpen = notific._id;
                    if (notific.isSeen == false) {
                        notific.isSeen = true;
                        updateField(notific._id, notific.isSeen, 'isSeen');
                    }
                }
          //  }
        };

        $scope.setStatus = function (notific, status) {

            var statusFields = null;
            if(notific.notificType == 'inviteToEvent' && $scope.isOpen == notific._id && notific.status != status)
            {
                notific.status = status;
                statusFields = {"status": status,
                    "notificId": notific._id,
                    "notificType": 'inviteToEvent'};
            }
            else if(notific.notificType == 'eventSuggestion' && $scope.isOpen == notific._id && notific.suggestionStatus != status)
            {
                notific.suggestionStatus = status;
                statusFields = {"suggestionStatus": status,
                    "notificId": notific._id,
                    "notificType": 'eventSuggestion'};
            }

            if(statusFields)
            {
                var saveStatus = new SaveStatus(statusFields);
                saveStatus.$save(function()
                {
                    if(notific.notificType == 'eventSuggestion')
                    {
                        $route.reload();
                    }

                },
                function(errorResponse)
                {
                    $scope.error = errorResponse.data.message;
                });
            }

        };

        var updateField = function (notificId, valueToEnter, field) {

            var updateF = new UpdateField({"notificId": notificId, "valueToEnter": valueToEnter, "field": field});
            updateF.$save(function (response)
            {
                console.info("response: " + response);
            },
            function(errorResponse)
            {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.checkboxSet = function (notific, time) {

            if ($scope.isOpen == notific._id && notific.status == 'Propose Another Time')
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
        }

    }
]);
