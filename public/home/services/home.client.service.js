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
    .factory('GetRelevantEvents', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/getRelevantEvents',
                {},
                { search: { method: 'GET', isArray: true } }); }])
    .factory('MatchingUsersAndEvents', ['$resource',
        function($resource) {
            return $resource('api/sportEvts/matchingUsersAndEvents'); }])
;