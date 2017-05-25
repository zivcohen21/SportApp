/**
 * Created by ZIV on 20/03/2017.
 */
var geocoder = require('geocoder');
var distance = require('google-distance-matrix');
var maps_key = 'AIzaSyCSZ6zngMxdeDcnN_8spITilH6k4fQpdzU';
exports.getLatLng = function (address, callback) {
    var gpsLocation = {
        "lat": 0,
        "lng": 0
    };
    geocoder.geocode(address, function ( err, data ) {
        if(err)
        {
            console.info("err");
        }
        else {
            console.info("data: " + JSON.stringify(data));
            gpsLocation.lat = data.results[0].geometry.location.lat;
            gpsLocation.lng = data.results[0].geometry.location.lng;
            console.info("gpsLocation: " + JSON.stringify(gpsLocation));
        }
        callback(gpsLocation);
    });
};

exports.getDistanceBetweenTwoAddresses = function (userItem, eventItem, gpsLoc1, gpsLoc2, callback) {

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
            return callback(userItem, eventItem, distance);
        }
    });

};