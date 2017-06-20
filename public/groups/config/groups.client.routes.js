/**
 * Created by ZIV on 17/11/2016.
 */
angular.module('groups').config(['$routeProvider',
    function($routeProvider)
    {
        $routeProvider.
        when('/groups',{templateUrl: 'groups/views/group-main.client.view.html' }).
        when('/groups/myGroups',{templateUrl: 'groups/views/list-my-groups.client.view.html' }).
        when('/groups/allGroups',{templateUrl: 'groups/views/all-groups.client.view.html' }).
        when('/groups/create',{ templateUrl: 'groups/views/create-group.client.view.html' }).
        when('/groups/allGroups/:groupId',{templateUrl: 'groups/views/view-group.client.view.html' }).
        when('/groups/allGroups/:groupId/addMembers',{templateUrl: 'groups/views/add-user-to-group.client.view.html' }).
        when('/groups/allGroups/:groupId/joinRequests',{templateUrl: 'groups/views/join-requests-group.client.view.html' }).
        when('/groups/allGroups/:groupId/removeMembers',{templateUrl: 'groups/views/remove-user-from-group.client.view.html' }).
        when('/groups/allGroups/:groupId/edit', { templateUrl: 'groups/views/edit-group.client.view.html' });
    }
]);