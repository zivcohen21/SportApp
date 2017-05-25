/**
 * Created by ZIV on 27/11/2016.
 */
angular.module('notifics')
    .factory('Notifics',['$resource', function($resource)
    {
        return $resource('api/notifics/:notificId',
        { notificId: '@_id'},
        { update: { method: 'PUT' } });
    }])
    .factory('SetTimesArr', ['$resource',
        function($resource) {
            return $resource('api/notifics/setTimesArr'); }])
    .factory('GetMyNewNotifics', ['$resource',
        function($resource) {
            return $resource('api/notifics/getMyNewNotifics/:userId', { userId: '@_id'}); }])
    .factory('GetMyOldNotifics', ['$resource',
        function($resource) {
            return $resource('api/notifics/getMyOldNotifics/:userId', { userId: '@_id'}); }])
    .factory('SaveStatus', ['$resource',
        function($resource) {
            return $resource('api/notifics/saveStatus'); }])
    .factory('SaveTimes', ['$resource',
        function($resource) {
            return $resource('api/notifics/saveTimes'); }])
    .factory('GetMyNotifics', ['$resource',
        function($resource) {
            return $resource('api/notifics/getMyNotifics/:userId', { userId: '@_id'}); }])
    .factory('RemoveNotifics', ['$resource',
        function($resource) {
            return $resource('api/removeNotific/:notificId', { notificId: '@_id'}, { removeNot: { method: 'DELETE' }}); }])
    .factory('UpdateField', ['$resource',
        function($resource) {
            return $resource('api/notifics/updateField'); }])
;