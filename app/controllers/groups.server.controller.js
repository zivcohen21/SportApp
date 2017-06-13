/**
 * Created by ZIV on 17/11/2016.
 */
var mongoose = require('mongoose'),
    general = require('../../app/controllers/general.server.controller'),
    googleMaps = require('../../app/controllers/googleMaps.server.controller'),
    notifics = require('../../app/controllers/notifics.server.controller'),
    url = require('url'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User');
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
    var group = new Group(req.body);
    console.info("group: " + JSON.stringify(group));
    group.creator = req.user;
    group.save(function(err)
    {
        if (err)
        {
            return res.status(401).send({ message: getErrorMessage(err) });
        }
        else {
            User.update({_id: req.user.id}, {$push: {myGroups: group.id}}).exec(function(err) {
                if (err) {
                    return res.status(402).send({message: getErrorMessage(err)});
                }
            });

            User.update({_id: req.user.id}, {$push: {myGroupsAdmin: group.id}}).exec(function(err) {
                if (err) {
                    return res.status(403).send({message: getErrorMessage(err)});
                }
            });

            notifics.createAndSendGroupsNotifics(req, res, group, 'addToGroup');

            res.json(group);
        }
    });
};
exports.list = function(req, res)
{
    Group.find().sort('-created').populate('creator defaultCourt theSportType', 'firstName lastName fullName title').exec(function(err, group)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(group); }
    });
};
exports.groupByID = function(req, res, next, id)
{
    Group.findById(id).populate('creator members defaultCourt theSportType askedToJoin', 'firstName lastName fullName username city title').exec(function(err, group)
    {
        if (err)
            return next(err);
        if (!group)
            return next(new Error('Failed to load group ' + id));
        req.group = group; next();
    });
};
exports.read = function(req, res)
{
    res.json(req.group);
};
exports.update = function(req, res)
{
    var group = req.group;
    group.isSearched = req.body.isSearched;
    group.title = req.body.title;
    group.defaultCourt = req.body.defaultCourt;
    group.theSportType = req.body.theSportType;

    group.minAge = req.body.minAge;
    group.maxAge = req.body.maxAge;
    group.forFemale = req.body.forFemale;
    group.forMale = req.body.forMale;

    console.info("group: " + group);
    group.save(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(group); }
    });
};
exports.delete = function(req, res)
{
    var group = req.group;
    var groupId = req.group.id;
    group.remove(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            User.update({_id: req.user.id}, {$pull: {myGroups: groupId}}).exec(function(err) {
                if (err) {
                    return res.status(400).send({message: getErrorMessage(err)});
                }
            });
            User.update({_id: req.user.id}, {$pull: {myGroupsAdmin: groupId}}).exec(function(err) {
                if (err) {
                    return res.status(400).send({message: getErrorMessage(err)});
                }
            });
            res.json(group);
        }
    });
};
exports.hasAuthorization = function(req, res, next)
{
    if (req.group.creator.id !== req.user.id)   //if the user is the group admin
    {
        return res.status(403).send({ message: 'User is not authorized' });
    }
    next();
};
exports.getMyGroups = function (req, res)
{
    Group.find({$or: [{creator: req.user.id}, {members: {$in: [req.user.id]}}]}).sort('-created').populate('creator defaultCourt theSportType', 'firstName lastName fullName title').exec(function(err, group)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(group); }
    });
};

exports.joinToGroup = function (req, res)
{
    var user = req.user;
    var groupId = req.body.groupId;


    Group.update({_id: groupId}, {$push: {askedToJoin: user._id}}).exec(function(err) {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
    });

    User.update({_id: user._id}, {$push: {askedToJoinToGroup: groupId}}).exec(function(err) {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
    });

    res.json(groupId);
};

exports.addUsersToGroup = function (req, res)
{

    var groupId = req.body.groupId;
    var allIds = req.body.allIds;
    Group.findById(groupId).populate('creator members defaultCourt theSportType askedToJoin', 'firstName lastName fullName username city title').exec(function(err, group) {

        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            for (var i = 0; i < allIds.length; i++)
            {
                Group.update({_id: group.id}, {$push: {members: allIds[i]}}).exec(function(err) {
                    if (err) {
                        return res.status(400).send({message: getErrorMessage(err)});
                    }
                });
                notifics.createAndSendGroupsNotificsForMember(req, res, group, 'addToGroup', allIds[i]);
            }

            res.json(group);
        }

    });
};

exports.addRequestsToGroup = function (req, res)
{

    var groupId = req.body.groupId;
    var requestsToAdd = req.body.requestsToAdd;
    Group.findById(groupId).populate('creator members defaultCourt theSportType askedToJoin', 'firstName lastName fullName username city title').exec(function(err, group) {

        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            for (var i = 0; i < requestsToAdd.length; i++)
            {
                Group.update({_id: group.id}, {$push: {members: requestsToAdd[i]}}, {$pull: {askedToJoin: requestsToAdd[i]}}).exec(function(err) {
                    if (err) {
                        return res.status(400).send({message: getErrorMessage(err)});
                    }
                });
                User.update({_id: requestsToAdd[i]}, {$push: {myGroups: groupId}}).exec(function(err) {
                    if (err) {
                        return res.status(400).send({message: getErrorMessage(err)});
                    }
                });
                notifics.createAndSendGroupsNotificsForMember(req, res, group, 'addToGroup', requestsToAdd[i]);
            }

            res.json(group);
        }

    });
};

exports.removeUsersFromGroup = function (req, res)
{

    var groupId = req.body.groupId;
    var allIds = req.body.allIds;
    console.info("allIds: " + JSON.stringify(allIds));

    Group.findById(groupId).populate('creator members defaultCourt theSportType askedToJoin', 'firstName lastName fullName username city title').exec(function(err, group) {

        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        for (var i = 0; i < allIds.length; i++)
        {
            Group.update({_id: group.id}, {$pull: {members: allIds[i]}}).exec(function(err) {
                if (err) {
                    return res.status(400).send({message: getErrorMessage(err)});
                }
            });

            notifics.createAndSendGroupsNotificsForMember(req, res, group, 'removeFromGroup', allIds[i]);

            if(allIds[i] == group.creator)
            {

                Group.update({_id: group.id}, {creator: group.members[0]}).exec(function(err) {
                    if (err) {
                        return res.status(400).send({message: getErrorMessage(err)});
                    }
                });

                User.update({_id: allIds[i]}, {$pull: {myGroupsAdmin: groupId}}).exec(function(err) {
                    if (err) {
                        return res.status(400).send({message: getErrorMessage(err)});
                    }
                });
            }
        }

        res.json(group);
    });
};

exports.getMembersOfGroup = function (req, res)
{
    var groupId = req.group.id;
    Group.find({_id: groupId}, '-_id members askedToJoin').exec(function(err, members) {

        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            res.json(members);
        }

    });
};



exports.getAllMembersOfGroups = function (req, res)
{
    var query = url.parse(req.url, true).query;
    var allGroups = query.allGroups;
    console.info("allGroups: " + allGroups);
    Group.find({_id: { $in: allGroups}}, '-_id members askedToJoin').exec(function(err, members) {

        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            res.json(members);
        }

    });
};

exports.getGroupsNotInEventAndCanBeAdded = function (req, res)
{
    var query = url.parse(req.url, true).query;
    var groupsInEvent = query.groupsInEvent;
    var groupsInEventLength = query.groupsInEventLength;
    console.info("groupsInEvent: " + groupsInEvent);
    if(groupsInEventLength > 1)
    {
        Group.find({$and: [{_id: { $nin: groupsInEvent}}, {$or: [{isSearched: true}, {'members': {$in: [req.user.id]}}]} ]}).populate('creator defaultCourt theSportType', 'firstName lastName fullName title').exec(function(err, groupsNotInEvent)
        {
            if (err)
            {
                return res.status(400).send({ message: getErrorMessage(err) });
            }
            else {
                res.json(groupsNotInEvent);
            }
        });
    }
    else if(groupsInEventLength == 1)
    {
        Group.find({$and: [{_id: {$ne: groupsInEvent}}, {$or: [{isSearched: true}, {'members': {$in: [req.user.id]}}]} ]}).populate('creator defaultCourt theSportType', 'firstName lastName fullName title').exec(function(err, groupsNotInEvent)
        {
            if (err)
            {
                return res.status(400).send({ message: getErrorMessage(err) });
            }
            else {
                res.json(groupsNotInEvent);
            }
        });
    }
    else if(!groupsInEvent || groupsInEventLength == 0){
        Group.find({$or: [{isSearched: true}, {'members': {$in: [req.user.id]}}]}).populate('creator defaultCourt theSportType', 'firstName lastName fullName title').exec(function(err, groupsNotInEvent)
        {
            if (err)
            {
                return res.status(400).send({ message: getErrorMessage(err) });
            }
            else {
                res.json(groupsNotInEvent);
            }
        });
    }


};

exports.getGroupsCanBeAdded = function (req, res)
{
    Group.find({$or: [{isSearched: true}, {'members': {$in: [req.user.id]}}]}).sort('-created').populate('creator defaultCourt theSportType', 'firstName lastName fullName title').exec(function(err, group)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(group); }
    });
};


exports.getRelevantGroups = function(req, res)
{
    var query = url.parse(req.url, true).query;
    var userId = query.userId;
    var sportType = query.sportType;
    var country = query.country;
    var city = query.city;
    var radius = query.radius;
    var minMembers = query.minMembers;
    var maxMembers = query.maxMembers;
    var minAge = query.minAge;
    var maxAge = query.maxAge;
    var female = query.female;
    var male = query.male;

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
            Group.find().populate('creator defaultCourt theSportType', 'firstName lastName fullName title city country').exec(function(err, relevantGroups)
            {
                if (err)
                {
                    return res.status(400).send({ message: getErrorMessage(err) });
                }
                else if(relevantGroups.length > 0)
                {
                    var numOfEvents = relevantGroups.length;

                    console.info("relevantGroups.length: " + relevantGroups.length);
                    if (sportType)
                    {
                        console.info("sportType: " + sportType);
                        funcArr.push(general.searchBySportTypeOfGroup);
                        paramArr.push(sportType);
                    }
                    if (country)
                    {
                        console.info("country: " + country);
                        funcArr.push(general.searchByCountry);
                        paramArr.push(country);
                    }
                    if (city)
                    {
                        funcArr.push(general.searchByCityOfGroup);
                        paramArr.push(city);
                    }
                    if(minMembers)
                    {
                        funcArr.push(general.searchByMinMembersInGroup);
                        paramArr.push(minMembers);
                    }
                    if(maxMembers)
                    {
                        funcArr.push(general.searchByMaxMembersInGroup);
                        paramArr.push(maxMembers);
                    }
                    if(minAge)
                    {
                        funcArr.push(general.searchByMinAge);
                        paramArr.push(minAge);
                    }
                    if(maxAge)
                    {
                        funcArr.push(general.searchByMaxAge);
                        paramArr.push(maxAge);
                    }

                    if((!female && male) || (female && !male))
                    {
                        funcArr.push(general.searchByGender);
                        if(female)
                            paramArr.push('female');
                        else if(male)
                            paramArr.push('male');
                    }

                    for (var i = 0; i < numOfEvents; i++)
                    {
                        //if (country.toUpperCase() == relevantUsers[i].country.toUpperCase())
                        //{
                        var isMatch = true;
                        for (var j = 0; j < funcArr.length; j++)
                        {
                            if (!funcArr[j](paramArr[j], relevantGroups[i]))
                            {
                                isMatch = false;
                                break;
                            }
                        }
                        if(isMatch) {
                            finalArr.push(relevantGroups[i]);
                        }
                        //}
                    }

                    if(radius > 0)
                    {
                        var theUserLocation = theUser[0].gpsLocation;
                        var userCheckedCounter = 0;
                        var numOfElements = finalArr.length;
                        for(i = 0; i < numOfElements; i++)
                        {
                            var otherUserLocation = finalArr[i].gpsLocation;
                            googleMaps.getDistanceBetweenTwoAddresses(1,1,theUserLocation, otherUserLocation, function (a,b,distance) {
                                distance = distance /1000;

                                console.info("userCheckedCounter: " + userCheckedCounter);
                                console.info("numOfElements: " + numOfElements);
                                if (distance <= radius) {
                                    console.info("distance1: " + distance);
                                    console.info("radius1: " + radius);
                                    console.info("userCheckedCounter1: " + userCheckedCounter);
                                    arrToReturn.push(finalArr[userCheckedCounter]);
                                }
                                else {
                                    console.info("userCheckedCounter2: " + userCheckedCounter);
                                    console.info("distance2: " + distance);
                                    console.info("radius2: " + radius);
                                }
                                userCheckedCounter++;
                                if (userCheckedCounter >= numOfElements) {
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
                    console.info("relevantGroups: " + relevantGroups);
                    res.json(relevantGroups);
                }
            });
        }

    });

};