/**
 * Created by ZIV on 19/12/2016.
 */
angular.module('sportEvts')
    .factory('SportEvts', ['$resource',
    function($resource) {
        return $resource('api/sportEvts/:sportEvtId',
            { sportEvtId: '@_id' },
            { update: { method: 'PUT' } }); }])
    .factory('GetOneSportEvtForUpdate', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getOneSportEvtForUpdate/:sportEvtId',
                { sportEvtId: '@_id' }); }])
    .factory('GetAllCourts', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getAllCourts'); }])
    .factory('GetGroupsCanBeAdded', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getGroupsCanBeAdded'); }])
    .factory('GetMembers', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getMembers/:groupId', { groupId: '@_id'}); }])
    .factory('GetAllUsers', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getAllUsers'); }])
    .factory('GetAllSportTypes', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getAllSportTypes'); }])
    .factory('GetMySportEvts', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getMySportEvts/:userId', { userId: '@_id'}); }])
    .factory('GetSportEvtsCreatedByMe', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getSportEvtsCreatedByMe/:userId', { userId: '@_id'}); }])
    .factory('GetAllMembersOfGroups', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getAllMembersOfGroups',
                {},
                { getAllMembers: { method: 'GET', isArray: true } }); }])
    .factory('AllUsersNotInEvent', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getUsersNotInEvent',
                {},
                { getUsersNotInEvent: { method: 'GET', isArray: true } }); }])
    .factory('AllGroupsNotInEvent', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getGroupsNotInEvent',
                {},
                { getGroupsNotInEvent: { method: 'GET', isArray: true } }); }])
    .factory('AddUsersToEvent', ['$resource',
        function($resource) {
            return $resource('api/addUsersToEvent'); }])
    .factory('AddUserRequestsToEvent', ['$resource',
        function($resource) {
            return $resource('api/addUserRequestsToEvent'); }])
    .factory('RemoveUsersFromEvent', ['$resource',
        function($resource) {
            return $resource('api/removeUsersFromEvent'); }])
    .factory('JoinToEvent', ['$resource',
        function($resource) {
            return $resource('api/joinToEvent'); }])
;