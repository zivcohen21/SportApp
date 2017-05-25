/**
 * Created by ZIV on 15/03/2017.
 */
var mongoose = require('mongoose'),
    general = require('../../app/controllers/general.server.controller');

var getErrorMessage = function(err)
{
    if (err.errors)
    {
        for (var errName in err.errors)
        {
            if (err.errors[errName].message)
                return err.errors[errName].message;
        }
    }
    else
    { return 'Unknown server error'; }
};

