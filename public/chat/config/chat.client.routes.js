/**
 * Created by ZIV on 17/11/2016.
 */
angular.module('chat').config(['$routeProvider',
    function($routeProvider)
    {
        $routeProvider.
        when('/chat',{ templateUrl: 'chat/views/chat.client.view.html' });
    }
]);