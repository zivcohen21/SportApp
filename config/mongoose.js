/**
 * Created by ZIV on 09/11/2016.
 */
var config = require('./config'),
    mongoose = require('mongoose');
module.exports = function()
{
    var db = mongoose.connect(config.db);
    require('../app/models/user.server.model');
    require('../app/models/group.server.model');
    require('../app/models/court.server.model');
    require('../app/models/sportEvt.server.model');
    require('../app/models/sportType.server.model');
    require('../app/models/notific.server.model');
    require('../app/models/schedule.server.model');

    return db;
};