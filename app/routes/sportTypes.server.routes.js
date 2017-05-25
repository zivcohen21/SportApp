/**
 * Created by ZIV on 27/11/2016.
 */
var users = require('../../app/controllers/users.server.controller'),
    sportTypes = require('../../app/controllers/sportTypes.server.controller');
module.exports = function(app)
{
    app.route('/api/sportTypes')
        .get(sportTypes.list)
        .post(users.requiresLogin, sportTypes.create);
    app.route('/api/sportTypes/:sportTypeId')
        .get(sportTypes.read)
        .put(users.requiresLogin, sportTypes.update)
        .delete(users.requiresLogin, sportTypes.hasAuthorization, sportTypes.delete);
    app.param('sportTypeId', sportTypes.sportTypeByID);
};