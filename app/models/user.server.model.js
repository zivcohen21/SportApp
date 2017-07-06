/**
 * Created by ZIV on 13/11/2016.
 */
var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: { type: String, index: true, match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]},
    username: { type: String, trim: true, unique: true, required: 'Username is required' },
    password: { type: String, validate: [ function(password) { return password && password.length > 6; }, 'Password should be at least six characters long' ] },
    facebookLink: String,
    country: String,
    city: String,
    street: String,
    number: Number,
    localTimeZoneOffsetInMIn: Number,
    gpsLocation: {
        lat: Number,
        lng: Number
    },
    picture: {},
    notific: [{ type: Schema.ObjectId, ref: 'Notific' }],
    phoneNumber: {type: String, default: ""},
    sportTypes: [{ type: Schema.ObjectId, ref: 'SportType' }],
    yearOfBirth: Number,
    favoriteTimes: [{
        day: String,
        favoriteHours: [{
            index: Number,
            timeAsString: String,
            timeInMin: Number,
            isIn: Boolean
        }]
    }],
    favoriteArrSize: {type: Number, default: 48},
    isSearched: Boolean,
    radiusOfSearch: Number,
    myGroups: [{type: Schema.ObjectId, ref: 'Group'}],
    myGroupsAdmin: [{type: Schema.ObjectId, ref: 'Group'}],
    mySportEvts: [{type: Schema.ObjectId, ref: 'SportEvt'}],
    myEventSuggestions: [{type: Schema.ObjectId, ref: 'SportEvt'}],
    myAcceptedSportEvts: [{type: Schema.ObjectId, ref: 'SportEvt'}],
    myRejectedSportEvts: [{type: Schema.ObjectId, ref: 'SportEvt'}],
    rejectEventsResults: JSON,
    salt: { type: String },
    provider: { type: String, required: 'Provider is required' },
    providerId: String,
    providerData: {},
    askedToJoinToEvent: [{type: Schema.ObjectId, ref: 'SportEvt'}],
    askedToJoinToGroup: [{type: Schema.ObjectId, ref: 'Group'}],
    created: { type: Date, default: Date.now },
    newUser: {type: Boolean, default: true},
    role: { type: String, enum: ['Admin', 'Owner', 'User'] },
    currentModuleInApp: { type: String, default: 'SportApp' }
});
UserSchema.virtual('fullName').get(function()
{
    return this.firstName + ' ' + this.lastName;
}).set(function(fullName)
    {
        var splitName = fullName.split(' ');
        this.firstName = splitName[0] || '';
        this.lastName = splitName[1] || '';
    });
UserSchema.virtual('userAddress').get(function()
{
    return this.number + ' ' + this.street + ' ' + this.city + ' ' + this.country;
});
UserSchema.set('toJSON', { getters: true, virtuals: true });
UserSchema.pre('save', function(next)
{
    if (this.password)
    {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});
UserSchema.virtual('age').get(function()
{
    var currYear = new Date().getUTCFullYear();
    return (currYear - this.yearOfBirth);
});
UserSchema.pre('remove', function(next) {
    // Remove all the assignment docs that reference the removed person.
    //To-do for creator
    this.model('Group').update({members: {$in: [this._id]}}, {$pull: {members: this._id}}, next);
    this.model('Group').update({blackList: {$in: [this._id]}}, {$pull: {blackList: this._id}}, next);
    this.model('Group').update({askedToJoin: {$in: [this._id]}}, {$pull: {askedToJoin: this._id}}, next);

    this.model('Court').update({userThere: {$in: [this._id]}}, {$pull: {userThere: this._id}}, next);

    this.model('Notific').remove({ user: this._id }, next);

    this.model('SportEvt').update({'allParticipantsAndNotific.theUser': {$in: [this._id]}}, {$pull: {'allParticipantsAndNotific.theUser': this._id}}, next);
    this.model('SportEvt').update({singleParticipants: {$in: [this._id]}}, {$pull: {members: this._id}}, next);
    this.model('SportEvt').update({members: {$in: [this._id]}}, {$pull: {askedToJoin: this._id}}, next);
    this.model('SportEvt').update({members: {$in: [this._id]}}, {$pull: {askedToJoin: this._id}}, next);

});

UserSchema.methods.hashPassword = function(password)
{
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
};
UserSchema.methods.authenticate = function(password)
{ return this.password === this.hashPassword(password); };
UserSchema.statics.findUniqueUsername = function(username, suffix, callback)
{
    var _this = this;
    var possibleUsername = username + (suffix || '');
    _this.findOne({ username: possibleUsername },
    function(err, user)
    {
        if (!err)
        {
            if (!user)
            {
                callback(possibleUsername);
            }
            else
            {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        }
        else
        { callback(null); }
    });
};
UserSchema.plugin(deepPopulate, {
    populate: {
        'theEvent.creator': {
            select: 'fullName'
        },
        'theEvent.allParticipants':{
            select: 'username'
        },
        'allParticipantsAndNotific.theUser': {
            select: 'fullName'
        }
    }
});

mongoose.model('User', UserSchema);