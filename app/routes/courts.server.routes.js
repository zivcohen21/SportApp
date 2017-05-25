/**
 * Created by ZIV on 27/11/2016.
 */
var users = require('../../app/controllers/users.server.controller'),
    courts = require('../../app/controllers/courts.server.controller');
module.exports = function(app)
{
    app.route('/api/courts')
        .get(courts.list)
        .post(users.requiresLogin, courts.create);
    app.route('/api/courts/:courtId')
        .get(courts.read)
        .put(users.requiresLogin, courts.update)
        .delete(users.requiresLogin, courts.hasAuthorization, courts.delete);
    app.param('courtId', courts.courtByID);
};