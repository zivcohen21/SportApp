/**
 * Created by ZIV on 17/11/2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupSchema = new Schema({
    created:
    {
        type: Date, default: Date.now
    },
    title:
    {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank' },
    image: {data: Buffer, contentType: String },
    theSportType: { type: Schema.ObjectId, ref: 'SportType' },
    isSearched: Boolean,
    defaultCourt: { type: Schema.ObjectId, ref: 'Court'},
    members: [{type: Schema.ObjectId, ref: 'User'}],
    openEvents: [{type: Schema.ObjectId, ref: 'SportEvt'}],
    lastEvents: [{type: Schema.ObjectId, ref: 'SportEvt'}],
    blackList: [{type: Schema.ObjectId, ref: 'User'}],
    askedToJoin: [{type: Schema.ObjectId, ref: 'User'}],
    minAge: Number,
    maxAge: Number,
    forFemale: Boolean,
    forMale: Boolean,
    creator:
    {
        type: Schema.ObjectId,
        ref: 'User'
    }
});


mongoose.model('Group', GroupSchema);