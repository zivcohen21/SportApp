/**
 * Created by ZIV on 16/11/2016.
 */
var mainApplicationModuleName = 'mean';
var mainApplicationModule = angular.module(mainApplicationModuleName, ['ngResource', 'ngRoute', 'users', 'home',
    'groups', 'chat', 'courts', 'sportEvts', 'sportTypes', 'notifics', 'menu']);
mainApplicationModule.config(['$locationProvider', function($locationProvider)
{
   $locationProvider.hashPrefix('!');
}]);
if (window.location.hash === '#_=_')
    window.location.hash = '#!';
angular.element(document).ready(function()
{
    angular.bootstrap(document, [mainApplicationModuleName]);
});