/**
 * Created by ZIV on 20/03/2017.
 */
var geocoder = require('geocoder');
var distance = require('google-distance-matrix');
var timezone = require('node-google-timezone');
var maps_key = 'AIzaSyCSZ6zngMxdeDcnN_8spITilH6k4fQpdzU';

exports.getLatLng = function (address, callback) {
    var gpsLocation = {
        "lat": 0,
        "lng": 0
    };
    var currTime = new Date();
   // var currTimeInMIn =
    var timestamp = currTime.getTime() / 1000;
    geocoder.geocode(address, function ( err, data ) {
        if(err)
        {
            console.info("err");
        }
        else {

            gpsLocation.lat = data.results[0].geometry.location.lat;
            gpsLocation.lng = data.results[0].geometry.location.lng;
            console.info("gpsLocation: " + JSON.stringify(gpsLocation));
            timezone.key('AIzaSyD_ytQZv50eis11SOeR72xQOBv6p-5aCc0');

            timezone.data(gpsLocation.lat, gpsLocation.lng, timestamp, function (err, tz) {

                if(err)
                {
                    console.info("err");
                }
                else {
                    console.info(tz.raw_response);
                    //=> { dstOffset: 3600,
                    //     rawOffset: -18000,
                    //     status: 'OK',
                    //     timeZoneId: 'America/New_York',
                    //     timeZoneName: 'Eastern Daylight Time' }

                    console.info(tz.local_timestamp);
                    // => 1402614905

                    var d = new Date(tz.local_timestamp * 1000);

                    console.info(d.toDateString() + ' - ' + d.getHours() + ':' + d.getMinutes());
                    // => Thu Jun 12 2014 - 20:15

                    var totalOffset = tz.raw_response.rawOffset + tz.raw_response.dstOffset;

                    callback(gpsLocation, totalOffset);
                }

            });

        }

    });
};

exports.getDistanceBetweenTwoAddresses = function (index, userItem, eventItem, gpsLoc1, gpsLoc2, callback) {

    var origins = [gpsLoc1.lat + "," + gpsLoc1.lng];
    var destinations = [gpsLoc2.lat + "," + gpsLoc2.lng];
    //console.info("origins: " + origins);
    //console.info("destinations: " + destinations);
    distance.key(maps_key);
    distance.matrix(origins, destinations, function (err, distances) {
        if (err) {
            return console.info(err);
        }
        if(!distances) {
            return console.info('no distances');
        }
        if (distances.status == 'OK') {

            for (var i=0; i < origins.length; i++) {
                for (var j = 0; j < destinations.length; j++) {
                    var origin = distances.origin_addresses[i];
                    var destination = distances.destination_addresses[j];
                    if (distances.rows[0].elements[j].status == 'OK') {
                        var distance = distances.rows[i].elements[j].distance.value;
                        console.info('Distance from ' + origin + ' to ' + destination + ' is ' + distance);
                    } else {
                        //console.info(destination + ' is not reachable by land from ' + origin);
                    }
                }
            }
            return callback(index, userItem, eventItem, distance);
        }
    });

};