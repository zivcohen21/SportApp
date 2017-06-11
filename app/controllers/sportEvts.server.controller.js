/**
 * Created by ZIV on 19/12/2016.
 */
var mongoose = require('mongoose'),
    general = require('../../app/controllers/general.server.controller'),
    groups = require('../../app/controllers/groups.server.controller'),
    googleMaps = require('../../app/controllers/googleMaps.server.controller'),
    users = require('../../app/controllers/users.server.controller'),
    notifics = require('../../app/controllers/notifics.server.controller'),
    url = require('url'),
    SportEvt = mongoose.model('SportEvt'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User'),
    Notific = mongoose.model('Notific'),
    Court = mongoose.model('Court');

var getErrorMessage = function(err)
{ if (err.errors)
{
    for (var errName in err.errors)
    {
        if (err.errors[errName].message) return err.errors[errName].message;
    }
} else { return 'Unknown server error'; } };

exports.create = function(req, res)
{
    var sportEvt = new SportEvt(req.body);
    sportEvt.creator = req.user;
    sportEvt.startTimeInMin = (Number(sportEvt.startTimeAsString.split(":")[0])*60
    + Number(sportEvt.startTimeAsString.split(":")[1]));
    sportEvt.startTimeInMin += (new Date(sportEvt.dateEvtAsString).getTime() / 60000);
    var allParticipantsAndNotific = sportEvt.allParticipantsAndNotific;

    Court.find({_id: sportEvt.court}, 'localTimeZoneOffsetInMIn').exec(function(err, court) {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
        else {
            if(court[0].localTimeZoneOffsetInMIn)
            {
                console.info("sportEvt.startTimeInMin: " +  sportEvt.startTimeInMin);
                sportEvt.startTimeInMin -= court[0].localTimeZoneOffsetInMIn;
                console.info("sportEvt.startTimeInMin: " +  sportEvt.startTimeInMin);
            }

            console.info("sportEvt: " + JSON.stringify(sportEvt));
            sportEvt.save(function(err)
            {
                if (err) {
                    return res.status(410).send({ message: getErrorMessage(err) });
                }
                else {
                    User.update({_id: sportEvt.creator}, {$push: {mySportEvtsAdmin: sportEvt._id}}).exec(function(err) {
                        if (err) {
                            return res.status(401).send({message: getErrorMessage(err)});
                        }
                    });

                    for (var i = 0; i < allParticipantsAndNotific.length; i++)
                    {
                        User.update({_id: allParticipantsAndNotific[i].theUser}, {$push: {mySportEvts: sportEvt._id}}).exec(function(err) {
                            if (err) {
                                return res.status(402).send({message: getErrorMessage(err)});
                            }
                        });
                    }
                    notifics.createAndSendNotifics(req, res, sportEvt);
                }
            });
        }
    });




};
exports.list = function(req, res)
{

    SportEvt.find().sort('-created').populate('allParticipantsAndNotific creator court sportType allParticipantsAndNotific.theUser allParticipantsAndNotific.notific groups groups.defaultCourt groups.theSportType', 'firstName lastName fullName title email city username defaultCourt theSportType').exec(function(err, sportEvts)
    {
        if (err) { return res.status(400).send({ message: getErrorMessage(err) }); }
        else { res.json(sportEvts); }
    });
};
exports.sportEvtByID = function(req, res, next, id) {
    SportEvt.findById(id).populate('creator sportType court', 'firstName lastName fullName title id').deepPopulate('allParticipantsAndNotific allParticipantsAndNotific.theUser allParticipantsAndNotific.notific groups askedToJoin groups.defaultCourt groups.theSportType', 'firstName lastName fullName title id members email status').exec(function(err, sportEvt)
    {
        if (err) return next(err);
        if (!sportEvt) return next(new Error('Failed to load sportEvt ' + id));
        req.sportEvt = sportEvt; next();
    });
};
exports.read = function(req, res) {
    res.json(req.sportEvt);
};
exports.update = function(req, res)
{
    var sportEvt = req.sportEvt;
    console.info("sportEvt: " + sportEvt);
    sportEvt.dateEvt = req.body.dateEvtAsString;
    sportEvt.dateEvtAsString = req.body.dateEvtAsString;
    sportEvt.startTimeAsString = req.body.startTimeAsString;
    sportEvt.startTimeInMin = (Number(sportEvt.startTimeAsString.split(":")[0])*60
    + Number(sportEvt.startTimeAsString.split(":")[1]));
    sportEvt.startTimeInMin += (new Date(sportEvt.dateEvtAsString).getTime() / 60000);
    sportEvt.court = req.body.court;

    Court.find({_id: sportEvt.court}, 'localTimeZoneOffsetInMIn').exec(function(err, court) {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
        else {
            if (court[0].localTimeZoneOffsetInMIn) {
                console.info("sportEvt.startTimeInMin: " + sportEvt.startTimeInMin);
                sportEvt.startTimeInMin -= court[0].localTimeZoneOffsetInMIn;
                console.info("sportEvt.startTimeInMin: " + sportEvt.startTimeInMin);
            }
            sportEvt.duration = req.body.duration;
            sportEvt.minNumOfMembers = req.body.minNumOfMembers;
            sportEvt.maxNumOfMembers = req.body.maxNumOfMembers;
            sportEvt.optNumOfMembers = req.body.optNumOfMembers;
            sportEvt.openForIndividuals = req.body.openForIndividuals;
            sportEvt.openForGroups = req.body.openForGroups;
            sportEvt.minAge = req.body.minAge;
            sportEvt.maxAge = req.body.maxAge;
            sportEvt.forFemale = req.body.forFemale;
            sportEvt.forMale = req.body.forMale;
            sportEvt.sportType = req.body.sportType;
            console.info("sportEvt: " + sportEvt);
            sportEvt.save(function(err)
            {
                if (err) {

                    return res.status(400).send({ message: getErrorMessage(err) });
                } else { res.json(sportEvt); }
            });
        }
    });

};
exports.delete = function(req, res)
{
    var sportEvt = req.sportEvt;
    sportEvt.remove(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(sportEvt); }
    });
};
exports.hasAuthorization = function(req, res, next)
{
    if (req.sportEvt.creator.id !== req.user.id)
    {
        return res.status(403).send({ message: 'User is not authorized' });
    } next();
};

exports.getOneSportEvtForUpdate = function(req, res) {

    var sportEvtId = req.sportEvt.id;
    console.info("sportEvtId: " + sportEvtId);
    SportEvt.find({_id: sportEvtId}).populate('court sportType', 'title' ).exec(function(err, sportEvt)
    {
        if (err) { return res.status(400).send({ message: getErrorMessage(err) }); }
        else {
            console.info("sportEvt: " + sportEvt);
            res.json(sportEvt); }
    });
};

exports.getAllCourts = function (req, res) {

    Court.find({}, 'title').exec(function(err, court)
   {
       if (err) { return res.status(400).send({ message: getErrorMessage(err) }); }
       else {
           res.json(court); }
   });
};

exports.getAllParticipants = function (req, res) {

    SportEvt.find({_id: req.sportEvt}, 'allParticipantsAndNotific').exec(function(err, allParticipantsAndNotific)
    {
        if (err) { return res.status(400).send({ message: getErrorMessage(err) }); }
        else {
            res.json(allParticipantsAndNotific); }
    });
};

exports.getMySportEvts = function(req, res)
{
    //updateIsStarted(req, res, function (response) {
        console.info("here2");
        SportEvt.find({'allParticipantsAndNotific.theUser': {$in: [req.user.id]}}).sort('-created').populate('creator court sportType allParticipantsAndNotific.theUser allParticipantsAndNotific.notific', 'firstName lastName fullName title email')
            .exec(function(err, mySportEvts)
            {
                if (err)
                {
                    return res.status(400).send({ message: getErrorMessage(err) });
                }
                else {
                    console.info("here3");
                    res.json(mySportEvts);

                }
            });
    //});

};


exports.getMyNextSportEvts = function(req, res)
{
    //updateIsStarted(req, res, function (response) {
        SportEvt.find({'allParticipantsAndNotific.theUser': {$in: [req.user.id]}}).sort('startTimeInMin').populate('creator court sportType allParticipantsAndNotific.theUser allParticipantsAndNotific.notific', 'firstName lastName fullName title email')
            .exec(function(err, myNextSportEvts)
            {
                if (err)
                {
                    return res.status(400).send({ message: getErrorMessage(err) });
                }
                else {
                    res.json(myNextSportEvts);
                }
            });
    //});

};

exports.getMyNextFiveSportEvts = function(req, res)
{

    updateIsStarted(req, res, function (response) {
        SportEvt.find({$and: [{'allParticipantsAndNotific.theUser': {$in: [req.user.id]}}, {isStarted: false }]}).sort('startTimeInMin').limit(5).populate('creator court sportType allParticipantsAndNotific.theUser allParticipantsAndNotific.notific', 'firstName lastName fullName title email')
            .exec(function(err, myNextSportEvts)
            {
                if (err)
                {
                    return res.status(400).send({ message: getErrorMessage(err) });
                }
                else {
                    res.json(myNextSportEvts);
                }
            });
   });

};


var updateIsStarted = function (req, res, callback) {

    SportEvt.update({$and: [{isStarted: false}, {startTimeInMin: {$lt: getCurrTimeInMIn()}}]}, {isStarted: true}).exec(function(err)
    {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
        else {
            return callback(1);
        }
    });
};


var getCurrTimeInMIn = function () {

    var currTime = new Date();
    console.info("currTime.getTime()/60000: " + currTime.getTime()/60000);
    return currTime.getTime()/60000;
};

exports.getSportEvtsOfGroup = function(req, res)
{
    var groupId = req.group.id;
    updateIsStarted(req, res, function (response) {
        SportEvt.find({groups: {$in: [groupId]}}).sort('-created').populate('creator court sportType allParticipantsAndNotific.theUser allParticipantsAndNotific.notific', 'firstName lastName fullName title')
            .exec(function(err, sportEvtsOfGroup)
            {
                if (err)
                {
                    return res.status(400).send({ message: getErrorMessage(err) });
                }
                else {
                    res.json(sportEvtsOfGroup);
                }
            });
    });
};

exports.getRelevantEvents = function(req, res)
{
    var query = url.parse(req.url, true).query;
    var userId = query.userId;
    var sportType = query.sportType;
    var dateEvtAsString = query.dateEvtAsString;
    var minStartTime = query.timeStart;
    var maxStartTime = query.timeEnd;
    var country = query.country;
    var city = query.city;
    var radius = query.radius;
    var minMembers = query.minMembers;
    var maxMembers = query.maxMembers;
    var minAge = query.minAge;
    var maxAge = query.maxAge;
    var female = query.female;
    var male = query.male;
    var eventsInRadius = [];
    var allDistances = [];
    var funcArr = [];
    var paramArr = [];
    var finalArr = [];
    var arrToReturn = [];

    User.find({_id: userId}).exec(function(err, user)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {
            SportEvt.find({$and: [{sportType: sportType}, {dateEvtAsString: dateEvtAsString}]}).sort('startTimeInMin').deepPopulate('creator court sportType allParticipantsAndNotific.theUser allParticipantsAndNotific.notific sportEvt.court', 'firstName lastName fullName title city country gpsLocation')
             .exec(function(err, relevantEvents)
             {
                 if (err)
                 {
                    return res.status(400).send({ message: getErrorMessage(err) });
                 }

                 else if(relevantEvents.length > 0)
                 {
                     var numOfEvents = relevantEvents.length;

                     console.info("relevantEvent.length: " + relevantEvents.length);
                     if (city)
                     {
                         funcArr.push(general.searchByCityOfEvent);
                         paramArr.push(city);
                     }
                     if(minMembers)
                     {
                         funcArr.push(general.searchByMinMembers);
                         paramArr.push(minMembers);
                     }
                     if(maxMembers)
                     {
                         funcArr.push(general.searchByMaxMembers);
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
                     if(minStartTime)
                     {
                         console.info("minStartTime: " + minStartTime);
                         funcArr.push(general.searchByMinStartTime);
                         paramArr.push(minStartTime);
                     }
                     if(maxStartTime)
                     {
                         console.info("maxStartTime: " + maxStartTime);
                         funcArr.push(general.searchByMaxStartTime);
                         paramArr.push(maxStartTime);
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
                         if (country.toUpperCase() == relevantEvents[i].court.country.toUpperCase())
                         {
                             var isMatch = true;
                             for (var j = 0; j < funcArr.length; j++)
                             {
                                 if (!funcArr[j](paramArr[j], relevantEvents[i]))
                                 {
                                     isMatch = false;
                                     break;
                                 }
                             }
                             if(isMatch) {
                                 finalArr.push(relevantEvents[i]);
                             }
                         }
                     }

                     if(radius > 0)
                     {
                         var userLocation = user[0].gpsLocation;
                         var eventCheckedCounter = 0;
                         var numOfElements = finalArr.length;
                         for(i = 0; i < numOfElements; i++)
                         {
                             var courtLocation = finalArr[i].court.gpsLocation;
                             googleMaps.getDistanceBetweenTwoAddresses(1,1,userLocation, courtLocation, function (a,b,distance) {
                                 distance = distance /1000;

                                 console.info("eventCheckedCounter: " + eventCheckedCounter);
                                 console.info("numOfElements: " + numOfElements);
                                 if (distance <= radius) {
                                     console.info("distance1: " + distance);
                                     console.info("radius1: " + radius);
                                     console.info("eventCheckedCounter1: " + eventCheckedCounter);
                                     arrToReturn.push(finalArr[eventCheckedCounter]);
                                 }
                                 else {
                                     console.info("eventCheckedCounter2: " + eventCheckedCounter);
                                     console.info("distance2: " + distance);
                                     console.info("radius2: " + radius);
                                 }
                                 eventCheckedCounter++;
                                 if (eventCheckedCounter >= numOfElements) {
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
                 console.info("relevantEvent: " + relevantEvents);
                    res.json(relevantEvents);
                 }
             });
        }

    });

};

exports.getCurrentCounter = function (sportEvt) {

    var noAnswerCounter = 0;
    var inCounter = 0;
    var outCounter = 0;
    var maybeCounter = 0;
    var proposeAnotherTimeCounter = 0;

    var allList = sportEvt.allParticipantsAndNotific;
    for (var i = 0; i < allList.length; i++)
    {
        if(allList[i].notific)
        {
            if(allList[i].notific.status == 'No Answer') { noAnswerCounter+=1; }
            else if(allList[i].notific.status == 'In') { inCounter+=1; }
            else if(allList[i].notific.status == 'Out') { outCounter+=1; }
            else if(allList[i].notific.status == 'Maybe') { maybeCounter+=1; }
            else if(allList[i].notific.status == 'Propose Another Time') { proposeAnotherTimeCounter+=1;}
        }
    }

    return {
        "noAnswer": noAnswerCounter,
        "in": inCounter,
        "out": outCounter,
        "maybe": maybeCounter,
        "proposeAnotherTime": proposeAnotherTimeCounter
    }

};

exports.addUsersToEvent = function (req, res)
{
    var singleParticipants = req.body.singleParticipants;
    var newParticipants = req.body.newParticipants;
    var listGroupsToAdd = req.body.listGroupsToAdd;
    var sportEvtId = req.body.sportEvtId;
    SportEvt.findById(sportEvtId).exec(function(err, sportEvt) {

        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else
        {
            for (var i = 0; i < listGroupsToAdd.length; i++)
            {
                SportEvt.update({_id: sportEvt._id}, {$push: {groups: listGroupsToAdd[i]}}).exec(function(err)
                {
                    if (err) {
                        return res.status(405).send({message: getErrorMessage(err)});
                    }
                });
            }
            notifics.createAndSendNotificsForNewParticipants(req, res, sportEvt, newParticipants, singleParticipants);

            res.json(sportEvt);
        }

    });
};

exports.addUserRequestsToEvent = function (req, res)
{
    var newParticipants = [];
    var singleParticipants = [];
    var requestsToAdd = req.body.requestsToAdd;
    var sportEvtId = req.body.sportEvtId;
    SportEvt.findById(sportEvtId).exec(function(err, sportEvt) {

        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }

        for (var i = 0; i < requestsToAdd.length; i++)
        {
            singleParticipants.push(requestsToAdd[i]);
            newParticipants.push(requestsToAdd[i]);
            SportEvt.update({_id: sportEvt._id}, {$pull: {askedToJoin: requestsToAdd[i]}}).exec(function(err)
            {
                if (err) {
                    return res.status(405).send({message: getErrorMessage(err)});
                }
            });
        }
        notifics.createAndSendNotificsForNewParticipants(req, res, sportEvt, newParticipants, singleParticipants);

        res.json(sportEvt);
    });
};

exports.removeUsersFromEvent = function (req, res)
{
    var userId = null;
    var sportEvtId = req.body.sportEvtId;
    var usersToRemove = req.body.usersToRemove;
    var groupsToRemove = req.body.groupsToRemove;
    console.info("groupsToRemove: " + groupsToRemove);
    console.info("groupsToRemove.length: " + groupsToRemove.length);
    SportEvt.findById(sportEvtId).exec(function(err, sportEvt) {

        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else
        {
            if(groupsToRemove.length > 0) {
                for (var groupIndex = 0; groupIndex < groupsToRemove.length; groupIndex++) {
                    Group.find({_id: groupsToRemove[groupIndex]}, '_id members').exec(function (err, members) {

                        if (err) {
                            return res.status(400).send({message: getErrorMessage(err)});
                        }
                        else {
                            console.info("members: " + members);
                            for (var memberIndex = 0; memberIndex < members[0].members.length; memberIndex++) {
                                if (!general.contains(usersToRemove, members[0].members[memberIndex]) && members[0].members[memberIndex] != req.user.id) {
                                    usersToRemove.push(members[0].members[memberIndex]);
                                }
                            }

                            SportEvt.update({_id: sportEvtId}, {$pull: {groups: members[0]._id}}).exec(function (err) {
                                if (err) {
                                    return res.status(400).send({message: getErrorMessage(err)});
                                }
                            });
                        }
                    });
                }
            }
            for (var i = 0; i < usersToRemove.length; i++)
            {
                for(var j = 0; j < sportEvt.allParticipantsAndNotific.length; j++)
                {

                    userId = sportEvt.allParticipantsAndNotific[j].theUser;
                    if(sportEvt.allParticipantsAndNotific[j]._id == usersToRemove[i])
                    {
                        SportEvt.update({_id: sportEvtId}, {$pull: {allParticipantsAndNotific: {_id: usersToRemove[i]}}}).exec(function(err) {
                            if (err) {
                                return res.status(400).send({message: getErrorMessage(err)});
                            }
                        });
                    }

                    else if(sportEvt.allParticipantsAndNotific[j].theUser == usersToRemove[i])
                    {
                        SportEvt.update({_id: sportEvtId}, {$pull: {allParticipantsAndNotific: {theUser: usersToRemove[i]}}}).exec(function(err) {
                            if (err) {
                                return res.status(400).send({message: getErrorMessage(err)});
                            }
                        });
                    }

                    User.update({_id: userId}, {$pull: {mySportEvts: sportEvt._id}}).exec(function(err) {
                        if (err) {
                            return res.status(400).send({message: getErrorMessage(err)});
                        }
                    });
                }
            }
            res.json(sportEvt);
        }
    });
};



exports.joinToEvent = function (req, res)
{
    var user = req.user;
    var sportEvtId = req.body.sportEvtId;


    SportEvt.update({_id: sportEvtId}, {$push: {askedToJoin: user._id}}).exec(function(err) {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
    });

    User.update({_id: user._id}, {$push: {askedToJoinToEvent: sportEvtId}}).exec(function(err) {
        if (err) {
            return res.status(400).send({message: getErrorMessage(err)});
        }
    });

    res.json(sportEvtId);
};

