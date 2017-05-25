/**
 * Created by ZIV on 27/11/2016.
 */
angular.module('notifics').config(['$routeProvider', function($routeProvider) { $routeProvider.
when('/notifics', { templateUrl: 'notifics/views/list-notifics.client.view.html' }).
when('/notifics/create', { templateUrl: 'notifics/views/create-notific.client.view.html' }).
when('/notifics/:notificId', { templateUrl: 'notifics/views/view-notific.client.view.html' }).
when('/notifics/:notificId/edit', { templateUrl: 'notifics/views/edit-notific.client.view.html' }).
when('/sportEvts/:sportEvtId', { templateUrl: 'sportEvts/views/view-sportEvt.client.view.html' });
}]);