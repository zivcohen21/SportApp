/**
 * Created by ZIV on 09/11/2016.
 */

exports.render = function(req, res)
{
    res.render('index',
    {
        title: 'SportApp',
        user: JSON.stringify(req.user)

    });
};