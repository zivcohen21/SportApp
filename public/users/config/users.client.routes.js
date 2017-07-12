/**
 * Created by ZIV on 17/11/2016.
 */
angular.module('users').config(['$routeProvider', function($routeProvider)
{$routeProvider.
    when('/users/list', { templateUrl: 'users/views/all-users.client.view.html' }).
    when('/users/:userId',{templateUrl: 'users/views/view-user.client.view.html' }).
    when('/allUsers',{templateUrl: 'users/views/list-users.client.view.html' }).
    when('/users/:userId/edit', { templateUrl: 'users/views/edit-user.client.view.html' }).
    when('/users/:userId/notifics', { templateUrl: 'notifics/views/my-notifics.client.view.html' }).
    when('/users/:userId/enterAddress', { templateUrl: 'users/views/address.client.view.html' }).
    when('/users/:userId/changeRole', { templateUrl: 'users/views/changeRole-user.client.view.html' });

}
]);