/* jshint node:true */

module.exports = function(app) {
	var mongoose = require('mongoose'),
	    ObjectId = mongoose.Types.ObjectId;

    ////    
    var db = app.locals.db;
    ////
    var Historical = db.Historical;
    ////

    function get(req, res) {
        var _id = req.params.id, query = {};
        query["doc._id"] = ObjectId(_id);

        Historical.findOneCustom({user: req.user, query: query}, function (err, item) {
            if(err){
                return res.status(500).send({ error: err.toString() });
            }
            if(!item){
                return res.status(500).send({ error: "item not found with ID: "+ _id});
            }
            res.send(item);
        });
    }

    return {
        get: get
    };
};
