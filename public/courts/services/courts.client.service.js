/**
 * Created by ZIV on 27/11/2016.
 */
angular.module('courts').factory('Courts',['$resource', function($resource)
{
    return $resource('api/courts/:courtId',
    { courtId: '@_id'},
    { update: { method: 'PUT' } });
}]);