/**
 * Created by ZIV on 27/11/2016.
 */
angular.module('sportTypes').factory('SportTypes',['$resource', function($resource)
{
    return $resource('api/sportTypes/:sportTypeId',
    { sportTypeId: '@_id'},
    { update: { method: 'PUT' } });
}]);