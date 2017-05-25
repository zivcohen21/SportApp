/**
 * Created by ZIV on 17/11/2016.
 */
angular.module('users').config(['$routeProvider', function($routeProvider)
{$routeProvider.
    when('/users/:userId',{templateUrl: 'users/views/view-user.client.view.html' }).
    when('/users/:userId/edit', { templateUrl: 'users/views/edit-user.client.view.html' }).
    when('/users/:userId/notifics', { templateUrl: 'notifics/views/my-notifics.client.view.html' }).
    when('/users/:userId/enterAddress', { templateUrl: 'users/views/address.client.view.html' });
}
]);