/**
 * Created by ZIV on 27/11/2016.
 */
var mongoose = require('mongoose'),
    Court = mongoose.model('Court'),
    User = mongoose.model('User'),
    url = require('url'),
    general = require('../../app/controllers/general.server.controller'),
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
    Court.find().sort('-created').populate('creator subCourts.sportType ', 'firstName lastName fullName title').exec(function(err, courts)
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
    googleMaps.getLatLng(address, function(gpsLocationInfo, totalOffset) {
      /*  console.info("gpsLocationInfo: " + JSON.stringify(gpsLocationInfo));
        console.info("totalOffset: " + totalOffset);*/
        var localTimeZoneOffsetInMIn = totalOffset / 60;
        Court.update({_id: court.id}, {gpsLocation: gpsLocationInfo, localTimeZoneOffsetInMIn: localTimeZoneOffsetInMIn}).exec(function(err)
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


exports.getRelevantCourts = function(req, res)
{
    var query = url.parse(req.url, true).query;
    var userId = query.userId;
    /*var sportType = query.sportType;*/
    var country = query.country;
    var city = query.city;
    var radius = query.radius;

    var funcArr = [];
    var paramArr = [];
    var finalArr = [];
    var arrToReturn = [];

    User.find({_id: userId}).exec(function(err, theUser)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            // User.find({$and: [{sportType: sportType}, {country: country}]}).exec(function(err, relevantUsers)
            Court.find({country: country}).exec(function(err, relevantCourts)
            {
                if (err)
                {
                    return res.status(400).send({ message: getErrorMessage(err) });
                }
                else if(relevantCourts.length > 0)
                {
                    var numOfCourts = relevantCourts.length;

                    console.info("relevantCourts.length: " + relevantCourts.length);
                    if (city)
                    {
                        funcArr.push(general.searchByCityOfItem);
                        paramArr.push(city);
                    }

                    for (var i = 0; i < numOfCourts; i++)
                    {
                        var isMatch = true;
                        for (var j = 0; j < funcArr.length; j++)
                        {
                            if (!funcArr[j](paramArr[j], relevantCourts[i]))
                            {
                                isMatch = false;
                                break;
                            }
                        }
                        if(isMatch) {
                            finalArr.push(relevantCourts[i]);
                        }
                    }

                    if(radius > 0)
                    {
                        var theUserLocation = theUser[0].gpsLocation;
                        var courtCheckedCounter = 0;
                        var numOfElements = finalArr.length;
                        for(i = 0; i < numOfElements; i++)
                        {
                            var courtLocation = finalArr[i].gpsLocation;
                            googleMaps.getDistanceBetweenTwoAddresses(1,1,theUserLocation, courtLocation, function (a,b,distance) {
                                distance = distance /1000;

                                console.info("courtCheckedCounter: " + courtCheckedCounter);
                                console.info("numOfElements: " + numOfElements);
                                if (distance <= radius) {
                                    console.info("distance1: " + distance);
                                    console.info("radius1: " + radius);
                                    console.info("courtCheckedCounter1: " + courtCheckedCounter);
                                    arrToReturn.push(finalArr[courtCheckedCounter]);
                                }
                                else {
                                    console.info("courtCheckedCounter2: " + courtCheckedCounter);
                                    console.info("distance2: " + distance);
                                    console.info("radius2: " + radius);
                                }
                                courtCheckedCounter++;
                                if (courtCheckedCounter >= numOfElements) {
                                    console.info("finalArr.length: " + arrToReturn.length);
                                    res.json(arrToReturn);
                                }
                            });
                        }
                    }
                    else {
                        arrToReturn = finalArr;
                        console.info("arrToReturn.length: " + arrToReturn.length);
                        res.json(arrToReturn);
                    }
                }
                else {
                    console.info("relevantCourts: " + relevantCourts);
                    res.json(relevantCourts);
                }
            });
        }

    });

};