/**
 * Created by ZIV on 27/11/2016.
 */
var mongoose = require('mongoose'),
    SportType = mongoose.model('SportType');
var getErrorMessage = function(err)
{
    if (err.errors)
    {
        for (var errName in err.errors)
        {
            if (err.errors[errName].message)
                return err.errors[errName].message;
        }
    }
    else
        { return 'Unknown server error'; }
};
exports.create = function(req, res)
{
    var sportType = new SportType(req.body);
    sportType.creator = req.user;
    sportType.save(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else
        {
            res.json(sportType);
        }
    });
};
exports.list = function(req, res)
{
    SportType.find().sort('title').populate('creator', 'firstName lastName fullName').exec(function(err, sportTypes)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(sportTypes); }
    });
};
exports.sportTypeByID = function(req, res, next, id)
{
    SportType.findById(id).populate('creator', 'firstName lastName fullName').exec(function(err, sportType)
    {
        if (err)
            return next(err);
        if (!sportType)
            return next(new Error('Failed to load sportType ' + id));
        req.sportType = sportType;
        next();
    });
};
exports.read = function(req, res)
{
    res.json(req.sportType);
};
exports.update = function(req, res)
{
    var sportType = req.sportType;
    sportType.title = req.body.title;
    sportType.icon = req.body.icon;
    sportType.save(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(sportType); }
    });
};
exports.delete = function(req, res)
{
    var sportType = req.sportType;
    sportType.remove(function(err)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else { res.json(sportType); }
    });
};
exports.hasAuthorization = function(req, res, next)
{
    if (req.sportType.creator.id !== req.user.id && req.user.role != 'Owner')
    {
        return res.status(403).send({ message: 'User is not authorized' });
    }
    next();
};
exports.getAllSportTypes = function (req, res)
{
    SportType.find().exec(function(err, sportTypes)
    {
        if (err)
        {
            return res.status(400).send({ message: getErrorMessage(err) });
        }
        else {

            res.json(sportTypes);
        }
    });
};