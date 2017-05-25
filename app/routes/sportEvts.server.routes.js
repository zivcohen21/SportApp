/**
 * Created by ZIV on 19/12/2016.
 */
var users = require('../../app/controllers/users.server.controller'),
    sportEvts = require('../../app/controllers/sportEvts.server.controller'),
    groups = require('../../app/controllers/groups.server.controller'),
    sportTypes = require('../../app/controllers/sportTypes.server.controller'),
    general = require('../../app/controllers/general.server.controller'),
    notifics = require('../../app/controllers/notifics.server.controller');

module.exports = function(app)
{
    app.route('/api/sportEvts').get(sportEvts.list).post(users.requiresLogin, sportEvts.create);
    app.route('/api/sportEvts/getAllCourts').get(sportEvts.getAllCourts);
    app.route('/api/sportEvts/getAllUsers').get(users.getAllUsers);
    app.route('/api/sportEvts/getAllSportTypes').get(sportTypes.getAllSportTypes);
    app.route('/api/sportEvts/getRelevantEvents').get(sportEvts.getRelevantEvents);
    app.route('/api/sportEvts/getUsersNotInEvent').get(users.getAllUsersNotInEvent);
    app.route('/api/sportEvts/getGroupsCanBeAdded').get(groups.getGroupsCanBeAdded);
    app.route('/api/sportEvts/getGroupsNotInEvent').get(groups.getGroupsNotInEventAndCanBeAdded);
    app.route('/api/addUsersToEvent').post(sportEvts.addUsersToEvent);
    app.route('/api/addUserRequestsToEvent').post(sportEvts.addUserRequestsToEvent);
    app.route('/api/joinToEvent').post(sportEvts.joinToEvent);
    app.route('/api/removeUsersFromEvent').post(sportEvts.removeUsersFromEvent);
    app.route('/api/sportEvts/getAllMembersOfGroups').get(groups.getAllMembersOfGroups);
    app.route('/api/sportEvts/matchingUsersAndEvents').get(general.matchingUsersAndEvents);
    app.route('/api/sportEvts/getMembers/:groupId').get(groups.getMembersOfGroup);
    app.route('/api/sportEvts/:sportEvtId').get(sportEvts.read).put(users.requiresLogin, sportEvts.hasAuthorization, sportEvts.update)
        .delete(users.requiresLogin, sportEvts.hasAuthorization, sportEvts.delete);
    app.route('/api/sportEvts/getOneSportEvtForUpdate/:sportEvtId').get(sportEvts.getOneSportEvtForUpdate);
    app.route('/api/notifics').get(notifics.list).post(users.requiresLogin, notifics.create);
    app.route('/api/sportEvts/getMySportEvts/:userId').get(sportEvts.getMySportEvts);
    app.route('/api/sportEvts/getMyNextSportEvts/:userId').get(sportEvts.getMyNextSportEvts);
    app.route('/api/sportEvts/getMyNextFiveSportEvts/:userId').get(sportEvts.getMyNextFiveSportEvts);
    app.param('sportEvtId', sportEvts.sportEvtByID);
    app.param('groupId', groups.groupByID);
    app.param('userId', users.userByID);
};