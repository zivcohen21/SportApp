/**
 * Created by ZIV on 17/11/2016.
 */
var users = require('../../app/controllers/users.server.controller'),
    groups = require('../../app/controllers/groups.server.controller'),
    sportEvts = require('../../app/controllers/sportEvts.server.controller');
module.exports = function(app)
{
    app.route('/api/groups').get(groups.list).post(users.requiresLogin, groups.create);
    app.route('/api/groups/getMyGroups/:userId').get(groups.getMyGroups);
    app.route('/api/groups/getAllUsers').get(users.getAllUsers);
    app.route('/api/groups/getAllUsersNotInGroup/:groupId').get(users.getAllUsersNotInGroup);
    app.route('/api/groups/getUsersInGroup/:groupId').get(users.getUsersInGroup);
    app.route('/api/joinToGroup').post(groups.joinToGroup);
    app.route('/api/addUsersToGroup').post(groups.addUsersToGroup);
    app.route('/api/addRequestsToGroup').post(groups.addRequestsToGroup);
    app.route('/api/removeUsersFromGroup').post(groups.removeUsersFromGroup);
    app.route('/api/groups/:groupId').get(groups.read).put(users.requiresLogin, groups.hasAuthorization,
        groups.update).delete(users.requiresLogin, groups.hasAuthorization, groups.delete);
    app.route('/api/groups/GetSportEvtsOfGroup/:groupId').get(sportEvts.getSportEvtsOfGroup);
    app.route('/api/getRelevantGroups').get(groups.getRelevantGroups);
    app.param('groupId', groups.groupByID);
};
