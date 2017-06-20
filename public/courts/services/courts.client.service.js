/**
 * Created by ZIV on 27/11/2016.
 */
angular.module('courts').factory('Courts',['$resource', function($resource)
{
    return $resource('api/courts/:courtId',
    { courtId: '@_id'},
    { update: { method: 'PUT' } }); }])
    .factory('getGroupsEventsUsersInCourt', ['$resource',
        function($resource) {
            return $resource('api/courts/getGroupsEventsUsersInCourt/:courtId', { courtId: '@_id'}); }])
;