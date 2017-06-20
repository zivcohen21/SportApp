/**
 * Created by ZIV on 13/11/2016.
 */
var users = require('../../app/controllers/users.server.controller'),
    passport = require('passport');
module.exports = function(app)
{
    app.route('/signup').get(users.renderSignup).post(users.signup);
    app.route('/signin').get(users.renderSignin).post(passport.authenticate('local',
    {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));
    app.route('/api/getRelevantUsers').get(users.getRelevantUsers);
    app.route('/api/saveTimesHome').post(users.saveTimesHome);
    app.route('/api/users')
        .get(users.list);
    app.route('/api/users/:userId')
        .get(users.read)
        .put(users.requiresLogin, users.update)
        .delete(users.delete);
/*    app.route('/api/removeUser/:userId').delete(users.requiresLogin, users.delete);*/
        /*.delete(users.requiresLogin, users.hasAuthorization, users.delete);*/
    app.route('/api/users/enterAddress').post(users.enterAddress);
    app.route('/api/users/updateRoleUser').post(users.updateRoleUser);
    app.param('userId', users.userByID);

    app.get('/signout', users.signout);
    app.get('/oauth/facebook', passport.authenticate('facebook', { scope: [ 'email' ] }, { failureRedirect: '/signin' }));
    app.get('/oauth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/signin', successRedirect: '/' }));
    app.get('/oauth/google', passport.authenticate('google', { failureRedirect: '/signin',
            scope: [ 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
        }));
    app.get('/oauth/google/callback', passport.authenticate('google', { failureRedirect: '/signin', successRedirect: '/#!' }));
};
