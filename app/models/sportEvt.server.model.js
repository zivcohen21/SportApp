/**
 * Created by ZIV on 19/12/2016.
 */
var mongoose = require('mongoose'), 
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var SportEvtSchema = new Schema({
    created: { type: Date, default: Date.now },
    dateEvt: Date,
    dateEvtAsString: String,
    startTimeAsString: String,
    startTimeInMin: Number,
    duration: Number,
    minDuration: Number,
    isEnded: Boolean,
    isStarted: Boolean,
    minNumOfMembers: Number,
    maxNumOfMembers: Number,
    optNumOfMembers: Number,
    minAge: Number,
    maxAge: Number,
    forFemale: Boolean,
    forMale: Boolean,
    openForIndividuals: Boolean,
    openForGroups: Boolean,
    currentNumOfMembers: Number,
    optimalTime: Date,
    allParticipantsAndNotific: [{
        theUser: {type: Schema.ObjectId, ref: 'User'},
        notific: { type: Schema.ObjectId, ref: 'Notific' }
    }],
    court: { type: Schema.ObjectId, ref: 'Court' },
    groups: [{ type: Schema.ObjectId, ref: 'Group'}],
    singleParticipants: [{type: Schema.ObjectId, ref: 'User'}],
    optionalCourts: [{ type: Schema.ObjectId, ref: 'Court' }],
    sportType: { type: Schema.ObjectId, ref: 'SportType' },
    askedToJoin: [{type: Schema.ObjectId, ref: 'User'}],
    arrTimesSize: {type: Number, default: 48},
    creator: { type: Schema.ObjectId, ref: 'User' } });
SportEvtSchema.plugin(deepPopulate, {
    populate: {
        'groups.defaultCourt': {
            select: 'title'
        },
        'groups.theSportType': {
            select: 'title'
        }

    }
});
mongoose.model('SportEvt', SportEvtSchema);
/*

//validation function
function lessThanMin(value) {
    return value.allParticipantsAndNotific.length < value.minNumOfMembers;
}

function betweenMinAndMax(value) {
    return (value.allParticipantsAndNotific.length >= value.minNumOfMembers && value.allParticipantsAndNotific.length <= maxNumOfMembers);
}

function moreThanMax(value) {
    return value.allParticipantsAndNotific.length > value.maxNumOfMembers;
}

function optimalNumber(value) {
    return value.allParticipantsAndNotific.length == value.optNumOfMembers;
}

var NumMembersSchema = new Schema({
    lessThanMin: {type:SportEvtSchema, validate: lessThanMin},
    betweenMinAndMax: {type:SportEvtSchema, validate: betweenMinAndMax},
    moreThanMax: {type:SportEvtSchema, validate: moreThanMax},
    optimalNumber: {type:SportEvtSchema, validate: optimalNumber}

});
mongoose.model('NumMembers', NumMembersSchema);*/
