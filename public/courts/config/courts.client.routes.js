/**
 * Created by ZIV on 27/11/2016.
 */
angular.module('courts').config(['$routeProvider', function($routeProvider) { $routeProvider.
when('/courts', { templateUrl: 'courts/views/all-courts.client.view.html' }).
when('/courts/create', { templateUrl: 'courts/views/create-court.client.view.html' }).
when('/courts/:courtId', { templateUrl: 'courts/views/view-court.client.view.html' }).
when('/courts/:courtId/edit', { templateUrl: 'courts/views/edit-court.client.view.html' });
}]);