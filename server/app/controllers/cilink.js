/* jshint node:true */

module.exports = function(app) {

    ////    
    var db = app.locals.db;
    ////
    var Annotation = db.Annotation;
    var CI = db.CI;
    var CILink = db.CILink;
    ////

    function get(req, res) {
        var _id = req.params.id;

        CILink.findOne({_id:_id}, function (err, ciLink) {
            if(err){
                return res.status(500).send({ error: err.toString() });
            }
            if(!ciLink){
                return res.status(500).send({ error: "CI Link not found with ID: "+ _id});
            }
            res.send(ciLink);
        });
    }

    function save(req, res, next) {
        var newCILinkData = req.body;
        newCILinkData.createdDate = new Date();

        CILink.create(newCILinkData, function (err, ciLink) {
            if (err) {
                return res.status(500).send({ error: err.toString() });
            }

            res.send(ciLink);
        });
    }

    return {
        get: get,
        save: save
    };
};
