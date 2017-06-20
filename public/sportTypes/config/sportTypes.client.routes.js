/**
 * Created by ZIV on 27/11/2016.
 */
angular.module('sportTypes').config(['$routeProvider', function($routeProvider) { $routeProvider.
when('/sportTypes', { templateUrl: 'sportTypes/views/all-sportTypes.client.view.html' }).
when('/sportTypes/create', { templateUrl: 'sportTypes/views/create-sportType.client.view.html' }).
when('/sportTypes/:sportTypeId', { templateUrl: 'sportTypes/views/view-sportType.client.view.html' }).
when('/sportTypes/:sportTypeId/edit', { templateUrl: 'sportTypes/views/edit-sportType.client.view.html' });
}]);