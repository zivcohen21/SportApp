/**
 * Created by ZIV on 17/11/2016.
 */
var mongoose = require('mongoose'),
    nodemailer = require('nodemailer'),
    Notific = mongoose.model('Notific'),
    SportType = mongoose.model('SportType'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    SportEvt = mongoose.model('SportEvt'),
    general = require('../../app/controllers/general.server.controller');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sportApp.ziv@gmail.com',
        pass: 'sportApp123'
    }
});


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
    var notific = new Notific(req.body);
    notific.creator = req.user;
    notific.save(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            res.json(notific);
        }
    });
};
exports.list = function(req, res)
{
    Notific.find().sort('-created').populate('creator theEvent', 'firstName lastName fullName dateEvtAsString').exec(function(err, notific)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(notific); }
    });
};
exports.notificByID = function(req, res, next, id)
{
    Notific.findById(id).deepPopulate('theEvent theEvent.sportType theEvent.creator theEvent.allParticipantsAndNotific', 'dateEvtAsString title').exec(function(err, notific)
    {
        console.info("notificId " + id);
        if (err)
            return next(err);
        if (!notific)
            return next(new Error('Failed to load notific ' + id));
        req.notific = notific; next();
    });
};
exports.read = function(req, res)
{
    Notific.update({_id: req.notific.id}, {$set: { 'isSeen': true }})
        .exec(function(err) {
            if (err) {
                return res.status(400).send({message: getErrorMessage(err)});
            }
        });
    res.json(req.notific);
};
exports.update = function(req, res)
{
    var notific = req.notific;
    notific.save(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(notific); }
    });
};
exports.delete = function(req, res)
{
    var notific = req.notific;
    var notificId = notific._id;
    Notific.update({_id: notificId}, {isDeleted: true}).exec(function(err) {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
    });
    res.json(notific);
   /* notific.remove(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            console.info("req.user.id " + req.user.id);
            console.info("notificId" + notificId);
            User.update({_id: req.user.id}, {$pull: {notific: notificId}}).exec(function(err) {
                if (err) {
                    return res.status(400).send({message: getErrorMessage(err)});
                }
            });
            res.json(notific);
        }
    });*/

};
exports.hasAuthorization = function(req, res, next)
{
    if (req.notific.creator.id !== req.user.id)   //if the user is the notific admin
    {
        return res.status(403).send({ message: 'User is not authorized' });
    }
    next();
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
    Notific.find({$and: [{user: req.user.id}, {isDeleted: false}]}).sort('-created').deepPopulate('creator theEvent.court theEvent.creator theEvent.sportType theEvent.group theGroup.title theGroup.creator', 'firstName lastName fullName username dateEvtAsString startTimeAsString court group sportType creator').exec(function(err, notific)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            res.json(notific); }
    });
};


exports.createAndSendEventsNotifics = function (req, res, sportEvt) {

    var allMembers = sportEvt.allParticipantsAndNotific;
    var allNotifics = [];
    var i, notificId;

    SportEvt.findById(sportEvt.id).deepPopulate('allParticipantsAndNotific allParticipantsAndNotific.theUser allParticipantsAndNotific.notific creator sportType court groups askedToJoin', 'firstName lastName fullName title id members email username').exec(function(err, sportEvt)
    {
        if (err)
        {
            return res.status(403).send({ message: getErrorMessage(err) });
        }
        else
        {
            for (i = 0; i < allMembers.length; i++) {

                allNotifics[i] = new Notific();
                allNotifics[i].notificType = 'inviteToEvent';
                allNotifics[i].theEvent = sportEvt;
                allNotifics[i].user = allMembers[i].theUser;
                allNotifics[i].status = 'No Answer';
                if(sportEvt.singleParticipants.length > 0)
                {
                    allNotifics[i].isPartOfGroup = !general.contains(sportEvt.singleParticipants, allMembers[i]);
                }
                else
                {
                    allNotifics[i].isPartOfGroup = false;
                }
                allNotifics[i].isSeen = false;
                allNotifics[i].arrTimes = general.setTimesArr(sportEvt.arrTimesSize);
                notificId = allNotifics[i].id;
                allNotifics[i].save(function(err)
                {
                    if (err)
                    {
                        return res.status(403).send({ message: getErrorMessage(err) });
                    }

                });
                User.update({_id: allMembers[i]}, {$push: {notific: notificId}}).exec(function(err)
                {
                    if (err) {
                        return res.status(404).send({message: getErrorMessage(err)});
                    }
                });
                SportEvt.update({_id: sportEvt, 'allParticipantsAndNotific.theUser': allMembers[i].theUser}, {$set: {'allParticipantsAndNotific.$.notific': notificId}}).exec(function(err)
                {
                    if (err) {
                        return res.status(405).send({message: getErrorMessage(err)});
                    }
                });

                User.findById(allMembers[i].theUser).exec(function(err, user) {
                    if (err) {
                        return res.status(403).send({message: getErrorMessage(err)});
                    }
                    else {
                        var text = sportEvt.creator.fullName + " invited you to a " + sportEvt.sportType.title + " event on " + sportEvt.dateEvtAsString + ", " + sportEvt.startTimeAsString + "\n"
                            + "The Event: " + process.env.MY_URL + "/#!/sportEvts/" + sportEvt._id;
                        var subject = 'Invitation To an Event';
                        sendEMail(user,subject, text);
                    }
                });

            }
            res.json(sportEvt);
        }
    });
};

exports.createAndSendEventsNotificsForNewParticipants = function (req, res, sportEvt, allMembers, singleParticipants) {

    var allNotifics = [];

    SportEvt.findById(sportEvt.id).deepPopulate('allParticipantsAndNotific allParticipantsAndNotific.theUser allParticipantsAndNotific.notific creator sportType court groups askedToJoin', 'firstName lastName fullName title id members email username').exec(function(err, sportEvt) {
        if (err) {
            return res.status(403).send({message: getErrorMessage(err)});
        }
        else {

            for (var i = 0; i < allMembers.length; i++) {

                allNotifics[i] = new Notific();
                allNotifics[i].notificType = 'inviteToEvent';
                allNotifics[i].theEvent = sportEvt._id;
                allNotifics[i].user = allMembers[i];
                allNotifics[i].status = 'No Answer';
                if (singleParticipants.length > 0) {
                    allNotifics[i].isPartOfGroup = !general.contains(singleParticipants, allMembers[i]);
                }
                else {
                    allNotifics[i].isPartOfGroup = false;
                }
                allNotifics[i].isSeen = false;
                allNotifics[i].arrTimes = general.setTimesArr(sportEvt.arrTimesSize);
                var notificId = allNotifics[i].id;
                allNotifics[i].save(function (err) {
                    if (err) {
                        return res.status(403).send({message: getErrorMessage(err)});
                    }

                });
                User.update({_id: allMembers[i]}, {$push: {notific: notificId}}).exec(function (err) {
                    if (err) {
                        return res.status(404).send({message: getErrorMessage(err)});
                    }
                });
                User.update({_id: allMembers[i]}, {$push: {mySportEvts: sportEvt._id}}).exec(function (err) {
                    if (err) {
                        return res.status(404).send({message: getErrorMessage(err)});
                    }
                });

                var participantAndNotific =
                {
                    "theUser": allMembers[i],
                    "notific": allNotifics[i]
                };

                SportEvt.update({_id: sportEvt._id}, {$push: {'allParticipantsAndNotific': participantAndNotific}}).exec(function (err) {
                    if (err) {
                        return res.status(405).send({message: getErrorMessage(err)});
                    }
                });
                User.findById(allMembers[i]).exec(function (err, user) {
                    if (err) {
                        return res.status(403).send({message: getErrorMessage(err)});
                    }
                    else {
                        var text = sportEvt.creator.fullName + " invited you to a " + sportEvt.sportType.title + " event on " + sportEvt.dateEvtAsString + ", " + sportEvt.startTimeAsString + "\n"
                            + "The Event: " + process.env.MY_URL + "/#!/sportEvts/" + sportEvt._id;
                        var subject = 'Invitation To an Event';
                        sendEMail(user,subject, text);
                    }
                });
            }
        }
    });
};



exports.createAndSendNotificsForRemoveParticipants = function (req, res, sportEvt, allMembers) {

    var allNotifics = [];
    var text;

    SportEvt.findById(sportEvt.id).deepPopulate('allParticipantsAndNotific allParticipantsAndNotific.theUser allParticipantsAndNotific.notific creator sportType court groups askedToJoin', 'firstName lastName fullName title id members email username').exec(function(err, sportEvt) {
        if (err) {
            return res.status(403).send({message: getErrorMessage(err)});
        }
        else {
            for (var i = 0; i < allMembers.length; i++) {

                allNotifics[i] = new Notific();
                allNotifics[i].notificType = 'removeFromEvent';
                allNotifics[i].theEvent = sportEvt._id;
                allNotifics[i].user = allMembers[i];
                allNotifics[i].isSeen = false;
                var notificId = allNotifics[i].id;
                allNotifics[i].save(function (err) {
                    if (err) {
                        return res.status(403).send({message: getErrorMessage(err)});
                    }

                });
                User.update({_id: allMembers[i]}, {$push: {notific: notificId}}).exec(function (err) {
                    if (err) {
                        return res.status(404).send({message: getErrorMessage(err)});
                    }
                });

                for (var j = 0; j < sportEvt.allParticipantsAndNotific.length; j++) {
                    console.info("sportEvt.allParticipantsAndNotific[j].theUser: " + sportEvt.allParticipantsAndNotific[j].theUser._id);
                    console.info("allMembers[i]: " + allMembers[i]);

                    var userId = sportEvt.allParticipantsAndNotific[j].theUser._id;
                    if (sportEvt.allParticipantsAndNotific[j]._id == allMembers[i]) {
                        SportEvt.update({_id: sportEvt._id}, {$pull: {allParticipantsAndNotific: {_id: allMembers[i]}}}).exec(function (err) {
                            if (err) {
                                return res.status(400).send({message: getErrorMessage(err)});
                            }
                        });
                    }

                    else if (sportEvt.allParticipantsAndNotific[j].theUser._id == allMembers[i]) {
                        SportEvt.update({_id: sportEvt._id}, {$pull: {allParticipantsAndNotific: {theUser: allMembers[i]}}}).exec(function (err) {
                            if (err) {
                                return res.status(400).send({message: getErrorMessage(err)});
                            }
                        });
                    }

                    User.update({_id: userId}, {$pull: {mySportEvts: sportEvt._id}}).exec(function (err) {
                        if (err) {
                            return res.status(400).send({message: getErrorMessage(err)});
                        }
                    });
                }
                User.findById(allMembers[i]).exec(function (err, user) {
                    if (err) {
                        return res.status(403).send({message: getErrorMessage(err)});
                    }
                    else {
                        text = sportEvt.creator.fullName + " removed you from a " + sportEvt.sportType.title + " event on " + sportEvt.dateEvtAsString + ", " + sportEvt.startTimeAsString;
                        var subject = 'You were removed from an Event';
                        sendEMail(user,subject, text);
                    }
                });
            }
        }
    });

};

exports.createEventSuggestionNotific = function (sportEvt, user) {

    var notific = new Notific();
    notific.notificType = 'eventSuggestion';
    notific.theEvent = sportEvt;
    notific.user = user;
    notific.suggestionStatus = 'No Answer';
    notific.isSeen = false;

    var notificId = notific.id;
    notific.save(function(err)
    {
        if (err)
        {}
    });
    User.update({_id: user._id}, {$push: {notific: notificId}}).exec(function(err)
    {
        if (err) {}
    });

    var text = "Event Suggestion for " + sportEvt.sportType.title + " event on " + sportEvt.dateEvtAsString + ", " + sportEvt.startTimeAsString + "\n"
        + "The Event: " + process.env.MY_URL + "/#!/sportEvts/" + sportEvt._id;
    var subject = 'Event Suggestion';
    sendEMail(user,subject, text);
};


exports.createAndSendGroupsNotifics = function (req, res, group, type) {


    Group.findById(group.id).populate('creator members defaultCourt theSportType askedToJoin', 'firstName lastName fullName username city title').exec(function(err, group)
    {
        if (err)
        {
            return res.status(403).send({ message: getErrorMessage(err) });
        }
        else
        {
            for (var i = 0; i < group.members.length; i++)
            {
                module.exports.createAndSendGroupsNotificsForMember(req, res, group, type, group.members[i]);
            }
        }
    });
};

exports.createAndSendGroupsNotificsForMember = function (req, res, group, type, member) {

    var notificId;
    var notific = new Notific();
    notific.notificType = type;
    notific.theGroup = group;
    notific.user = member;
    notific.isSeen = false;
    notificId = notific.id;
    notific.save(function(err)
    {
        if (err)
        {
            return res.status(403).send({ message: getErrorMessage(err) });
        }

    });
    User.update({_id: member}, {$push: {notific: notificId}}).exec(function(err)
    {
        if (err) {
            return res.status(404).send({message: getErrorMessage(err)});
        }
    });

    User.findById(member).exec(function(err, user) {
        if (err) {
            return res.status(403).send({message: getErrorMessage(err)});
        }
        else {
            console.info("group: " + JSON.stringify(group));
            if(type == 'addToGroup')
            {
                User.update({_id: member}, {$push: {myGroups: group.id}}).exec(function(err) {
                    if (err) {
                        return res.status(404).send({message: getErrorMessage(err)});
                    }
                });

                var text = group.creator.fullName + " Added you to the group: " + group.title + "\n"
                    + "The Group: " + process.env.MY_URL + "/#!/groups/allGroups/" + group._id;
                var subject = 'You are joined to a group';
                sendEMail(user, subject, text);
            }
            else if(type == 'removeFromGroup')
            {
                User.update({_id: member}, {$pull: {myGroups: group.id}}).exec(function(err) {
                    if (err) {
                        return res.status(404).send({message: getErrorMessage(err)});
                    }
                });

                text = group.creator.fullName + " removed you from the group: " + group.title;
                subject = 'You were removed from a group';
                sendEMail(user, subject, text);
}
}
    });
};

var sendEMail = function (user, subject, text) {

    var mailOptions = {
        from: '"SportApp" <sportApp.ziv@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: subject, // Subject line
        text: text // plain text body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
};

exports.saveStatus = function(req, res)
{
   var notificId = req.body.notificId;
    console.info("req.body.notificType: " + req.body.notificType);
    if(req.body.notificType == 'inviteToEvent') {

        Notific.update({_id: notificId}, {status: req.body.status}).exec(function(err) {
            if (err) {
                return res.status(400).send({message: getErrorMessage(err)});
            }
            else {
                res.json(notificId)
            }
        });
    }

    else if(req.body.notificType == 'eventSuggestion')
    {
        var suggestionStatus = req.body.suggestionStatus;

        if (suggestionStatus == 'Accept')
        {
            //change notific and add to the event
            Notific.findById(notificId).populate('theEvent', 'arrTimesSize').exec(function (err, notific) {
                if (err) {
                    return res.status(400).send({message: getErrorMessage(err)});
                }
                else {

                    var arrTimes = general.setTimesArr(notific.theEvent.arrTimesSize);
                    Notific.update({_id: notificId}, {
                        suggestionStatus: suggestionStatus,
                        status: 'In',
                        notificType: 'inviteToEvent',
                        isPartOfGroup: false,
                        arrTimes: arrTimes
                    }).exec(function (err) {
                        if (err) {
                            return res.status(400).send({message: getErrorMessage(err)});
                        }
                        else {
                            var newParticipant = {
                                "theUser": notific.user,
                                "notific": notific
                            };
                            console.info("notific.theEvent._id: " + notific.theEvent._id);
                            SportEvt.update({$and: [ {_id: notific.theEvent._id}, {'allParticipantsAndNotific.theUser': {$nin: [req.user.id]}} ]}, {$push: {allParticipantsAndNotific: newParticipant}}).exec(function (err) {
                                if (err) {
                                    return res.status(409).send({message: getErrorMessage(err)});
                                }
                            });
                            User.update({_id: req.user.id}, {$push: {myAcceptedSportEvts: notific.theEvent._id}}).exec(function (err) {
                                if (err) {
                                    return res.status(409).send({message: getErrorMessage(err)});
                                }
                            });
                            res.json(notific)
                        }
                    });
                }

            });
        }
        else if(suggestionStatus == 'Reject')
        {
            Notific.findById(notificId).populate('theEvent').exec(function (err, notific) {
                if (err) {
                    return res.status(400).send({message: getErrorMessage(err)});
                }
                else {
                    if(!req.user.rejectEventsResults)
                    {
                        general.initialRejectArray(req.user)
                    }
                    general.addRejectEvt(req.user, req.user.rejectEventsResults, notific.theEvent);
                    User.update({_id: req.user.id}, {$push: {myRejectedSportEvts: notific.theEvent._id}}).exec(function (err) {
                        if (err) {
                            return res.status(409).send({message: getErrorMessage(err)});
                        }
                    });
                }
            });
        }
    }
};

exports.saveTimes = function(req, res)
{
    var notificId = req.body.notificId;
    var timeIndex = req.body.timeIndex;
    var isIn = req.body.isIn;
    console.info("notificId: " + notificId);
    console.info("timeIndex: " + timeIndex);
    console.info("isIn: " + isIn);
    Notific.update({_id: notificId, 'arrTimes.index': timeIndex}, {$set: { 'arrTimes.$.isIn': isIn }}).exec(function(err)
    {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
        else
        {
            res.json(notificId);
        }
    });
};


exports.updateField = function(req, res)
{
    var notificId = req.body.notificId;
   // var query = {};
   // query[field] = valueToEnter;
    Notific.update({_id: notificId}, {$set: { 'isSeen': true }})
        .exec(function(err) {
            if (err) {
                return res.status(400).send({message: getErrorMessage(err)});
            }
        });
    res.json(req.notific);
};
