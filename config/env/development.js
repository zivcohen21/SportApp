/**
 * Created by ZIV on 09/11/2016.
 */
module.exports =
{
    //db: 'mongodb://heroku_gl0sj1cj:2mch04ruh32qaccj1p4mg3guqg@ds151941.mlab.com:51941/heroku_gl0sj1cj',
    //db: 'mongodb://localhost/SportApp',
    db: process.env.MONGODB_URI,
    sessionSecret: 'developmentSessionSecret',
    facebook:
    {
        clientID: '1808936592727287',
        clientSecret: '559d179e1ea0d8cf0656e093c1ce903d',
        callbackURL: process.env.MY_URL + '/oauth/facebook/callback'
    },
    google:
    {
        clientID: '494948824631-ni8q0jdn9drjmhjmjm1gg5eeftuamfmg.apps.googleusercontent.com',
        clientSecret: 'vFEVsHjFYitm6yCXHPani7ng',
        callbackURL: process.env.MY_URL + '/oauth/google/callback'
    }
};
