/**
 * Created by ZIV on 17/11/2016.
 */
var users = require('../../app/controllers/users.server.controller'),
    notifics = require('../../app/controllers/notifics.server.controller'),
    sportEvts = require('../../app/controllers/sportEvts.server.controller'),
    schedule = require('../../app/controllers/schedule.server.controller');
module.exports = function(app)
{
    app.route('/api/notifics')
        .get(notifics.list)
        .post(users.requiresLogin, notifics.create);
    app.route('/api/notifics/getAllParticipants').get(sportEvts.getAllParticipants);
 /*   app.route('/api/notifics/getMyNewNotifics/:userId').get(notifics.getMyNewNotifics);
    app.route('/api/notifics/getMyOldNotifics/:userId').get(notifics.getMyOldNotifics);*/
    app.route('/api/notifics/saveStatus').post(notifics.saveStatus);
    app.route('/api/notifics/saveTimes').post(notifics.saveTimes);
    app.route('/api/notifics/:notificId')
        .get(notifics.read)
        .put(users.requiresLogin, notifics.update)
        .delete(users.requiresLogin, notifics.hasAuthorization, notifics.delete);
    app.route('/api/notifics/getMyNotifics/:userId').get(notifics.getMyNotifics);
    app.route('/api/removeNotific/:notificId').delete(users.requiresLogin, notifics.delete);
    app.route('/api/notifics/updateField').post(notifics.updateField);
    app.param('notificId', notifics.notificByID);
    app.param('userId', users.userByID);
};
