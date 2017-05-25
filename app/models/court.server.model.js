/**
 * Created by ZIV on 27/11/2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var CourtSchema = new Schema({
    created: {type: Date, default: Date.now},
    title: String,
    country: String,
    city: String,
    street: String,
    number: Number,
    gpsLocation: {
        lat: Number,
        lng: Number
    },
    subCourts: [{
        sportType: { type: Schema.ObjectId, ref: 'SportType' },
        numOfCourts: Number
    }],
    rate: Number,
    comments: [String],
    userThere: [{ type: Schema.ObjectId, ref: 'User' }],
    groupsThere: [{ type: Schema.ObjectId, ref: 'Group' }],
    pictures:  [{data: Buffer, contentType: String }],
    creator: { type: Schema.ObjectId, ref: 'User' }
});
CourtSchema.virtual('courtAddress').get(function()
{
    return this.country + ' ' + this.city + ' ' + this.street + ' ' + this.number;
});
CourtSchema.set('toJSON', { getters: true, virtuals: true });

mongoose.model('Court', CourtSchema);

