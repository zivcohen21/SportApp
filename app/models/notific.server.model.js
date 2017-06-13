/**
 * Created by ZIV on 17/11/2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var NotificSchema = new Schema({
    created:
    {
        type: Date, default: Date.now
    },
    user: {type: Schema.ObjectId, ref: 'User'},
    status: {type: String, enum: ['No Answer', 'In', 'Out', 'Maybe', 'Propose Another Time']},
    isPartOfGroup: Boolean,
    isSeen: Boolean,
    theEvent: {type: Schema.ObjectId, ref: 'SportEvt'},
    arrTimes: [{
        index: Number,
        timeAsString: String,
        timeInMin: Number,
        isIn: Boolean
    }],
    theGroup: {type: Schema.ObjectId, ref: 'Group'},
    creator:
    {
        type: Schema.ObjectId,
        ref: 'User'
    },
    text: String,
    notificType: {
        type: String, enum: ['inviteToEvent', 'eventSuggestion', 'addToGroup', 'removeFromGroup', 'removeFromEvent']
    },
    isDeleted: {type: Boolean, default: false},
    suggestionStatus: {type: String, enum: ['No Answer', 'Accept', 'Reject']}
});
NotificSchema.plugin(deepPopulate, {
    populate: {
        'theEvent.sportType': {
            select: 'title'
        },
        'theEvent.court': {
            select: 'title'
        },
        'theEvent.group': {
            select: 'title'
        },
        'theEvent.creator': {
            select: 'username'
        },
        'theGroup.creator': {
            select: 'username'
        },
    }
});
mongoose.model('Notific', NotificSchema);