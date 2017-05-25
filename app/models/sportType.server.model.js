/**
 * Created by ZIV on 26/01/2017.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var SportTypesSchema = new Schema({
    title: String,
    icon:  {data: Buffer, contentType: String },
    groups: { type: Schema.ObjectId, ref: 'Group' },
    users:  { type: Schema.ObjectId, ref: 'User' },
    courts: { type: Schema.ObjectId, ref: 'Court' },
    openEvents:  { type: Schema.ObjectId, ref: 'SportEvts' },
    pastEvents: { type: Schema.ObjectId, ref: 'SportEvts' },
    creator: { type: Schema.ObjectId, ref: 'User' }
});
mongoose.model('SportType', SportTypesSchema);