/**
 * Created by ZIV on 13/11/2016.
 */
var User = require('mongoose').model('User'),
    general = require('../../app/controllers/general.server.controller'),
    url = require('url'),
    passport = require('passport');
var mongoose = require('mongoose'),
    SportEvt = mongoose.model('SportEvt'),
    Group = mongoose.model('Group'),
    Notific = mongoose.model('Notific'),
    Court = mongoose.model('Court'),
    googleMaps = require('../../app/controllers/googleMaps.server.controller');

var getErrorMessage = function(err)
{
    var message = '';
    if (err.code)
    {
        switch (err.code)
        {
            case 11000:
            case 11001:
                message = 'Username already exists';
            break;
            default:
                message = 'Something went wrong';
        }
    } else
        {
            for (var errName in err.errors)
            {
                if (err.errors[errName].message)
                    message = err.errors[errName].message;
            }
        }
        return message;
};
exports.renderSignin = function(req, res, next)
{
    if (!req.user)
    {
        res.render('signin',
            {
                title: 'Sign-in Form',
                messages: req.flash('error') || req.flash('info')
            });
    }
    else
        { return res.redirect('/'); }
};
exports.renderSignup = function(req, res, next)
{
    if (!req.user)
    {
        res.render('signup',
        {
            title: 'Sign-up Form',
            messages: req.flash('error')
        });
    }
    else { return res.redirect('/'); }
};
exports.signup = function(req, res, next)
{
    if (!req.user)
    {
        var user = new User(req.body);
        var message = null;
        user.provider = 'local';
        user.save(function(err)
        {
             if (err)
            {
                var message = getErrorMessage(err);
                req.flash('error', message);
                return res.redirect('/signup');
            }
            req.login(user, function(err)
            {
                if (err) return next(err);
                enterLatLngToUser(req, res, user);
                setFavoriteTimesArr(user);
                return res.redirect('/');
            });
        });
    }
    else
        { return res.redirect('/'); }
};
exports.signout = function(req, res)
{
    req.logout();
    res.redirect('/');
};
exports.saveOAuthUserProfile = function(req, profile, done)
{
    User.findOne
    ({
        provider: profile.provider,
        providerId: profile.providerId
    },
    function(err, user)
    {
        if (err)
        { return done(err); }
        else {
            if (!user)
            {
                var possibleUsername = profile.username || ((profile.email) ? profile.email.split('@')[0] : '');
                User.findUniqueUsername(possibleUsername, null, function(availableUsername)
                {
                    profile.username = availableUsername;
                    user = new User(profile);
                    user.save(function(err)
                    {
                        if (err)
                        {
                            var message = this.getErrorMessage(err);
                            req.flash('error', message);
                            return res.redirect('/signup');
                        }
                        return done(err, user);
                    });
                });
            }
            else
                { return done(err, user); }
        }
    });
};
exports.requiresLogin = function(req, res, next)
{
    if (!req.isAuthenticated())
    {
        return res.status(401).send({ message: 'User is not logged in' });
    }
    next();
};
exports.getAllUsers = function (req, res)
{
    var creatorId = req.user.id;
    User.find({_id: { $ne: creatorId}}).exec(function(err, usersNoCreator)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {

            res.json(usersNoCreator);
        }
    });
};

exports.getAllUsersNotInGroup = function (req, res)
{
    User.find({_id: { $ne: req.user.id}, myGroups: { $nin: [req.group.id]}}).exec(function(err, users)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            res.json(users);
        }
    });
};
exports.getUsersInGroup = function (req, res)
{
    User.find({_id: { $ne: req.user.id}, myGroups: { $in: [req.group.id]}}).exec(function(err, users)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            res.json(users);
        }
    });
};
exports.list = function(req, res)
{
    User.find().sort('-created').exec(function(err, users)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(users); }
    });
};
exports.userByID = function(req, res, next, id)
{
    User.findById(id).exec(function(err, user)
    {
        if (err)
            return next(err);
        if (!user)
            return next(new Error('Failed to load user ' + id));
        req.user = user;
        next();
    });
};
exports.read = function(req, res)
{
    //setFavoriteTimesArr(req.user);  //temp
    res.json(req.user);
};
exports.update = function(req, res)
{
    var userId = req.user._id;

    User.update({_id: userId}, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        yearOfBirth: req.body.yearOfBirth,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        username: req.body.username,
        country: req.body.country,
        city: req.body.city,
        street: req.body.street,
        number: req.body.number,
        isSearched: req.body.isSearched,
        radiusOfSearch: req.body.radiusOfSearch,
        sportTypes: req.body.sportTypes,
        favoriteTimes: req.body.favoriteTimes
    }).exec(function(err)
    {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
        else {
            res.json(req.user);
        }
    });


    /* user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.yearOfBirth = req.body.yearOfBirth;
    user.email = req.body.email;
    user.username = req.body.username;
    user.country = req.body.country;
    user.city = req.body.city;
    user.street = req.body.street;
    user.number = req.body.number;
    user.isSearched = req.body.isSearched;
    user.radiusOfSearch = req.body.radiusOfSearch;
    user.sportTypes = req.body.sportTypes;
    user.favoriteTimes = req.body.favoriteTimes;
    console.info("user.favoriteTimes: " + JSON.stringify(user.favoriteTimes));
    user.save(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            console.info("user.favoriteTimes: " + JSON.stringify(user.favoriteTimes));
            res.json(user);
        }
    });*/
};

exports.delete = function (req, res, next) {
    req.user.remove(function (err) {
        if (err) {
            return next(err);
        } else {
            res.json(req.user);
        }
    })
};

/*exports.getMyNewNotifics = function(req, res)
{
    Notific.find({user: req.user.id, isSeen: false}).sort('-created').populate('creator theEvent', 'firstName lastName fullName dateEvtAsString').exec(function(err, notific)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            console.info("notific: " + notific);
            res.json(notific); }
    });
};
exports.getMyOldNotifics = function(req, res)
{
    Notific.find({user: req.user.id, isSeen: true}).sort('-created').populate('creator theEvent', 'firstName lastName fullName dateEvtAsString').exec(function(err, notific)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            console.info("notific: " + notific);
            res.json(notific); }
    });
};*/

exports.getMyNotifics = function(req, res)
{
    Notific.find({user: req.user.id}).sort('-created').deepPopulate('creator theEvent.court theEvent.sportType theEvent.group', 'firstName lastName fullName dateEvtAsString startTimeAsString court group sportType').exec(function(err, notific)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            res.json(notific); }
    });
};

exports.enterAddress = function(req, res)
{
    var country = req.body.country;
    var city = req.body.city;
    var street = req.body.street;
    var number = req.body.number;

    User.update({_id: req.body.userId}, {country: country, city: city, street: street, number: number}).exec(function(err) {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
        else {
            /*enterLatLng(req, res);*/
        }
    });
    res.json(req.body.userId);
};

var enterLatLngToUser = function (req, res, user) {

    var address = null;
    console.info("user: " + user);
    if(user && user.country && user.city && user.street && user.number)
    {
        address = user.number + " " + user.street + " " + user.city + " " + user.country;
    }
    else if (user && user.country && user.city)
    {
        address = user.city + " " + user.country;
    }
    googleMaps.getLatLng(address, function(gpsLocationInfo) {
        console.info("gpsLocationInfo: " + JSON.stringify(gpsLocationInfo));

        User.update({_id: user.id}, {gpsLocation: gpsLocationInfo}).exec(function(err)
        {
            if (err){
                return res.status(400).send({ message: getErrorMessage(err) });
            }
            else {}
        });
    });
     
};


var setFavoriteTimesArr = function (user) {

    var userId = user._id;
    console.info("userId: " + userId);
    var size = 48;
    var daysArr = ['s', 'm', 't','w','th','f','sa'];
    var favoriteTimesArr = [];
    for (var i = 0; i < daysArr.length; i++)
    {
        favoriteTimesArr.push({
            "day": daysArr[i],
            "favoriteHours": general.setTimesArr(size)
        });
    }

    User.update({_id: userId}, { favoriteTimes: favoriteTimesArr }).exec(function(err)
    {
        if (err) {}
    });
};

exports.saveUsersTimes = function(req, res)
{
    console.info("blabla");
    var timeIndex = req.body.timeIndex;
    var day = req.body.day;
    var isIn = req.body.isIn;
    console.info("notificId: " + day);
    console.info("req.user.id: " + req.user.id);
    console.info("isIn: " + isIn);
    User.update({_id: req.user.id, 'favoriteTimes.day': day, 'favoriteTimes.favoriteHours.index': timeIndex}, {$set: { 'favoriteTimes.favoriteHours.$.isIn': isIn }}).exec(function(err)
    {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
        else
        {
            res.json(req.user);
        }
    });
};
exports.getAllUsersNotInEvent = function (req, res)
{
    var query = url.parse(req.url, true).query;
    var usersInEvent = query.usersInEvent;
    var usersInEventLength = query.usersInEventLength;
    if(usersInEventLength > 1)
    {
        console.info("usersInEvent1: " + usersInEvent);
        User.find({_id: { $nin: usersInEvent}}).exec(function(err, usersNotInEvent)
        {
            if (err)
            {
                return res.status(400).send({ message: getErrorMessage(err) });
            }
            else {
                res.json(usersNotInEvent);
            }
        });
    }
    else if(usersInEventLength == 1)
    {
        console.info("usersInEvent2: " + usersInEvent);
        User.find({_id:  {$ne: usersInEvent}}).exec(function(err, usersNotInEvent)
        {
            if (err)
            {
                return res.status(400).send({ message: getErrorMessage(err) });
            }
            else {
                res.json(usersNotInEvent);
            }
        });
    }
    else if(!usersInEvent || usersInEventLength == 0)
    {
        console.info("usersInEvent3: " + usersInEvent);
        User.find().exec(function(err, usersNotInEvent)
        {
            if (err)
            {
                return res.status(400).send({ message: getErrorMessage(err) });
            }
            else {
                res.json(usersNotInEvent);
            }
        });
    }
};
