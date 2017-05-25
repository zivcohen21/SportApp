/**
 * Created by ZIV on 19/12/2016.
 */
angular.module('sportEvts').config(['$routeProvider', function($routeProvider)
{ $routeProvider.
    when('/sportEvts', { templateUrl: 'sportEvts/views/main-sportEvts.client.view.html' }).
    when('/sportEvts/list', { templateUrl: 'sportEvts/views/list-sportEvts.client.view.html' }).
    when('/sportEvts/mySportEvts', { templateUrl: 'sportEvts/views/list-my-sportEvts.client.view.html' }).
    when('/sportEvts/create', { templateUrl: 'sportEvts/views/create-sportEvt.client.view.html' }).
    when('/sportEvts/:sportEvtId', { templateUrl: 'sportEvts/views/view-sportEvt.client.view.html' }).
    when('/sportEvts/:sportEvtId/edit', { templateUrl: 'sportEvts/views/edit-sportEvts.client.view.html' }).
    when('/sportEvts/:sportEvtId/addMembers', { templateUrl: 'sportEvts/views/add-members-to-event.client.view.html' }).
    when('/sportEvts/:sportEvtId/joinRequests', { templateUrl: 'sportEvts/views/join-requests-sportEvt.client.view.html' }).
    when('/sportEvts/:sportEvtId/removeMembers', { templateUrl: 'sportEvts/views/remove-members-from-event.client.view.html' }).
    when('/sportEvts/notifics', { templateUrl: 'sportEvts/views/list-notifics.client.view.html' }).
    when('/sportEvts/notifics/:notificId', { templateUrl: 'sportEvts/views/view-notific.client.view.html' });
} ]);