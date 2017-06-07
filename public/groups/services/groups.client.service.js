/**
 * Created by ZIV on 17/11/2016.
 */
angular.module('groups')
    .factory('Groups', ['$resource',
    function($resource)
    {
        return $resource('api/groups/:groupId',
            { groupId: '@_id' },
            { update: { method: 'PUT' } }); }])
    .factory('GetMyGroups', ['$resource',
    function($resource) {
        return $resource('api/groups/getMyGroups/:userId', { userId: '@_id'}); }])
    .factory('GetAllUsers', ['$resource',
        function($resource) {
            return $resource('api/groups/getAllUsers'); }])
    .factory('AllUsersNotInGroup', ['$resource',
        function($resource) {
            return $resource('api/groups/getAllUsersNotInGroup/:groupId', { groupId: '@_id'}); }])
    .factory('UsersInGroup', ['$resource',
        function($resource) {
            return $resource('api/groups/getUsersInGroup/:groupId', { groupId: '@_id'}); }])
    .factory('JoinToGroup', ['$resource',
        function($resource) {
            return $resource('api/joinToGroup'); }])
    .factory('AddUsersToGroup', ['$resource',
        function($resource) {
            return $resource('api/addUsersToGroup'); }])
    .factory('AddRequestsToGroup', ['$resource',
        function($resource) {
            return $resource('api/addRequestsToGroup'); }])
    .factory('RemoveUsersFromGroup', ['$resource',
        function($resource) {
            return $resource('api/removeUsersFromGroup'); }])
    .factory('GetSportEvtsOfGroup', ['$resource',
        function($resource) {
            return $resource('api/groups/GetSportEvtsOfGroup/:groupId' , { groupId: '@_id'}); }])
;