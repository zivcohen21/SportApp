/**
 * Created by ZIV on 15/11/2016.
 */
var passport = require('passport'),
    url = require('url'),
    FacebookStrategy = require('passport-facebook').Strategy,
    config = require('../config'),
    users = require('../../app/controllers/users.server.controller');
module.exports = function()
{
    passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id', 'name', 'displayName', 'picture.type(large)', 'hometown', 'profileUrl', 'email'],
        passReqToCallback: true },
        function(req, accessToken, refreshToken, profile, done)
        {
            var providerData = profile._json;
            providerData.accessToken = accessToken;
            providerData.refreshToken = refreshToken;
        var providerUserProfile =
        {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            fullName: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            picture: profile.picture,
            city: profile.city,
            provider: 'facebook',
            providerId: profile.id,
            providerData: providerData
        };
        users.saveOAuthUserProfile(req, providerUserProfile, done);
    }));
};