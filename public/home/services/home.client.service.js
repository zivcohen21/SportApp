/**
 * Created by ZIV on 22/04/2017.
 */
angular.module('home')
    .factory('GetMyNextSportEvts', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getMyNextSportEvts/:userId', { userId: '@_id'}); }])
    .factory('GetMyNextFiveSportEvts', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getMyNextFiveSportEvts/:userId', { userId: '@_id'}); }])
    .factory('GetMySuggestions', ['$resource',
        function($resource) {
            return $resource('api/users/getMySuggestions/:userId', { userId: '@_id'}); }])
    .factory('GetRelevantEvents', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getRelevantEvents',
                {},
                { searchEvents: { method: 'GET', isArray: true } }); }])
    .factory('GetRelevantUsers', ['$resource',
        function($resource) {
            return $resource('api/getRelevantUsers',
                {},
                { searchUsers: { method: 'GET', isArray: true } }); }])
    .factory('GetRelevantCourts', ['$resource',
        function($resource) {
            return $resource('api/getRelevantCourts',
                {},
                { searchCourts: { method: 'GET', isArray: true } }); }])
    .factory('GetRelevantGroups', ['$resource',
        function($resource) {
            return $resource('api/getRelevantGroups',
                {},
                { searchGroups: { method: 'GET', isArray: true } }); }])
    .factory('MatchingUsersAndEvents', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/matchingUsersAndEvents'); }])
    .factory('SaveTimesHome', ['$resource',
        function($resource) {
            return $resource('api/saveTimesHome'); }])
;