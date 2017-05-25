/**
 * Created by ZIV on 27/11/2016.
 */
var mongoose = require('mongoose'),
    Court = mongoose.model('Court'),
    googleMaps = require('../../app/controllers/googleMaps.server.controller');

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
exports.create = function(req, res)
{
    var court = new Court(req.body);
    court.creator = req.user;
    court.save(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else
        {
            if (!court.title)
            {
                court.title = court.country + "-" + court.city + "-" + court.street;
                court.save();
            }
            if(court.country && court.city)
            {
                enterLatLngToCourt(req, res, court);
            }
            res.json(court);
        }
    });
};
exports.list = function(req, res)
{
    Court.find().sort('-created').populate('creator subCourts.sportType', 'firstName lastName fullName title').exec(function(err, courts)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(courts); }
    });
};
exports.courtByID = function(req, res, next, id)
{
    Court.findById(id).populate('creator', 'firstName lastName fullName').exec(function(err, court)
    {
        if (err)
            return next(err);
        if (!court)
            return next(new Error('Failed to load court ' + id));
        req.court = court;
        next();
    });
};
exports.read = function(req, res)
{
    res.json(req.court);
};
exports.update = function(req, res)
{
    var court = req.court;
    court.title = req.body.title;
    court.country = req.body.country;
    court.city = req.body.city;
    court.street = req.body.street;
    court.number =  req.body.number;
    court.save(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            if(court.country && court.city)
            {
                enterLatLngToCourt(req, res, court);
            }
            res.json(court);
        }
    });
};
exports.delete = function(req, res)
{
    var court = req.court;
    court.remove(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(court); }
    });
};
exports.hasAuthorization = function(req, res, next)
{
    if (req.court.creator.id !== req.user.id)
    {
        return res.status(403).send({ message: 'User is not authorized' });
    }
    next();
};

var enterLatLngToCourt = function (req, res, court) {

    var address = null;
    if(court && court.country && court.city && court.street && court.number)
    {
        address = court.number + " " + court.street + " " + court.city + " " + court.country;
    }
    else if (court && court.country && court.city)
    {
        address = court.city + " " + court.country;
    }
    googleMaps.getLatLng(address, function(gpsLocationInfo) {
        console.info("gpsLocationInfo: " + JSON.stringify(gpsLocationInfo));
        Court.update({_id: court.id}, {gpsLocation: gpsLocationInfo}).exec(function(err)
        {
            if (err)
            {
                return res.status(400).send({ message: getErrorMessage(err) });
            }
            else {

            }
        });
    });
};