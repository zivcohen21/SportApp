/**
 * Created by ZIV on 17/11/2016.
 */
angular.module('users').factory('Authentication',
    [
        function()
        {
            this.user = window.user;
            return { user: this.user };
        }
    ])
    .factory('Users', ['$resource',
        function($resource)
        {
            return $resource('api/users/:userId',
                { userId: '@_id' },
                { update: { method: 'PUT' } }); }])
    .factory('EnterAddress', ['$resource',
        function($resource) {
            return $resource('api/users/enterAddress'); }])
    .factory('SaveUsersTimes', ['$resource',
        function($resource) {
            return $resource('api/users/saveUsersTimes'); }])
    .factory('RemoveUser', ['$resource',
        function($resource) {
            return $resource('api/removeUser/:userId', { userId: '@_id'}, { removeUser: { method: 'DELETE' }}); }])
 ;