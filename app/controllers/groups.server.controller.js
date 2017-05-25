/**
 * Created by ZIV on 17/11/2016.
 */
var mongoose = require('mongoose'),
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
    group.creator = req.user;
    var allMembers = group.members;
    var i;
    group.save(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            User.update({_id: req.user.id}, {$push: {myGroups: group.id}}).exec(function(err) {
                if (err) {
                    return res.status(400).send({message: getErrorMessage(err)});
                }
            });

            User.update({_id: req.user.id}, {$push: {myGroupsAdmin: group.id}}).exec(function(err) {
                if (err) {
                    return res.status(400).send({message: getErrorMessage(err)});
                }
            });

            for (i = 0; i < allMembers.length; i++)
            {
                User.update({_id: allMembers[i]}, {$push: {myGroups: group.id}}).exec(function(err) {
                    if (err) {
                        return res.status(400).send({message: getErrorMessage(err)});
                    }
                });
            }

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
    Group.findById(groupId).exec(function(err, group) {

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

                User.update({_id: allIds[i]}, {$push: {myGroups: groupId}}).exec(function(err) {
                    if (err) {
                        return res.status(400).send({message: getErrorMessage(err)});
                    }
                });
            }

            res.json(group);
        }

    });
};

exports.addRequestsToGroup = function (req, res)
{

    var groupId = req.body.groupId;
    var requestsToAdd = req.body.requestsToAdd;
    Group.findById(groupId).exec(function(err, group) {

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
            }

            res.json(group);
        }

    });
};

exports.removeUsersFromGroup = function (req, res)
{

    var groupId = req.body.groupId;
    var allIds = req.body.allIds;
    Group.findById(groupId).exec(function(err, group) {

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

            User.update({_id: allIds[i]}, {$pull: {myGroups: groupId}}).exec(function(err) {
                if (err) {
                    return res.status(400).send({message: getErrorMessage(err)});
                }
            });
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


Array.prototype.contains = function ( needle ) {
    for (i in this) {
        if (this[i] == needle) return true;
    }
    return false;
};