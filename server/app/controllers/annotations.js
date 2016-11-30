/* jshint node:true */
var logger = require('../../utilities/logger');

module.exports = function(app) {

    var db = app.locals.db;
    ////    
    var Annotation = db.Annotation;
    var CI = db.CI;
	var annotationCategories = {
			Stuck: "errata",
			StuckCleared: "clearstuck",
			MarkApplied: "destacat",
			Note: "subratllat"
		};
    ////
    
    function getAnnotations(req, res) {
        var ciId = req.params.ciId,
            options = req.query,
            skip = req.query.skip,
            limit = req.query.limit,
            ciIds = [ciId],
            query = {
                ciId: {$in: ciIds},
                recordStatus: 0
            },        
         $or = [],
         reqQueryOptions = {};

    	if(options.stuck){
    		$or.push({category:annotationCategories.Stuck});
    		reqQueryOptions.stuck = true;
    	}
    	if(options.needsReview){
    		$or.push({category:annotationCategories.MarkApplied, reviewed: false});    
    		reqQueryOptions.needsReview = true;
    	}
    	if(options.notes){
    		$or.push({category:annotationCategories.Note});
    		reqQueryOptions.notes = true;
    	}
    	if(options.markedAsApplied){
    		$or.push({category:annotationCategories.MarkApplied});
    		reqQueryOptions.markedAsApplied = true;
    	}
    	if(options.clearstuck){
    		$or.push({category:annotationCategories.StuckCleared});
    		reqQueryOptions.clearstuck = true;
    	}
    	
    	if($or.length >1){
    		query.$or = $or;
    	}else if($or.length === 1){
        	if(reqQueryOptions.stuck){
        		query.category = annotationCategories.Stuck;
        	}else if(reqQueryOptions.needsReview){
        		query.category = annotationCategories.MarkApplied;
        		query.reviewed = false;   
        	}else if(reqQueryOptions.notes){
        		query.category = annotationCategories.Note;
        	}else if(reqQueryOptions.markedAsApplied){
        		query.category = annotationCategories.MarkApplied;
        	}else if(reqQueryOptions.clearstuck){
        		query.category = annotationCategories.StuckCleared;
        	}
    	}

        CI.findOneCustom({user: req.user, query:{ _id:ciId}}, function(err, _ci){
            if(err){
                return res.status(500).send({ error: err.toString() });
            }
            if(!_ci){
                return res.status(500).send({ error: "CI not found with ID: "+ ciId});
            }
            if(_ci.staple && _ci.staple.length !==0){
                for(var index in _ci.staple){
                    if(_ci.staple[index].ci_id){
                        ciIds.push(_ci.staple[index].ci_id);
                    }
                }
            }

            Annotation.count(query, function (err, count) {
                Annotation.find(query).sort({createdDate: -1}).skip(skip).limit(limit).exec(function (err, annotationCollection) {
                    res.send({
                        count: count,
                        annotations: annotationCollection
                    });
                });
            });

        });

    };

    /**
     * Used to get the list of Annotations for a CI by
     *
     * ciID - Id of the CI document
     * pageNum - page number of the CI document
     *
     * @param req Request Object
     * @param res Response Object
     */
    function getAnnotationsByPage(req, res) {
        var  ciId = req.params.ciId,
            pageNum = req.params.pageNum,
            query = {
                ciId: ciId,
                page: pageNum,
                recordStatus: 0
            };
        Annotation.findCustom({user: req.user, query:query}).exec(function (err, annotationCollection) {
            res.send(annotationCollection);
        });
    };

    function getAnnotation(req, res) {
        var id = req.params.anId;

        var query = {
            id: id,
            annotationId: id,
            recordStatus: 0
        };
        Annotation.findOneCustom({user: req.user, query:query}, function (err, annotation) {
            if(err){
                return res.status(500).send({ error: err.toString() });
            }
            if(!annotation){
                return res.status(500).send({ error: "Annotation not found with ID: "+ id});
            }
            res.send(annotation);
        });
    };

    function findAnnotationsCountByCategory(req, res) {
        var _ciId = req.params.ciId;
        var _category = req.params.category;
        var _ciIds = [_ciId];

        var _query = {
            ciId: {$in: _ciIds},
            category: _category,
            recordStatus: 0
        };
        
        if(_category === annotationCategories.MarkApplied && req.query.hasOwnProperty("reviewed")){
        	_query.reviewed = req.query.reviewed;        	
        }

        CI.findOneCustom({user: req.user, query:{ _id:_ciId}}, function(err, _ci){
            if(err){
                return res.status(500).send({ error: err.toString() });
            }
            if(!_ci){
                return res.status(500).send({ error: "CI not found with ID: "+ _ciId});
            }
            if(_ci.staple && _ci.staple.length !==0){
                for(var index in _ci.staple){
                    if(_ci.staple[index].ci_id){
                        _ciIds.push(_ci.staple[index].ci_id);
                    }
                }
            }
            Annotation.count(_query, function (err, count) {
                res.send({
                    count: count
                });
            });
        });

    };

    /**
     * Used to create the Annotation for a CI document
     *
     * @param req
     * @param res
     * @param next
     */
    function createAnnotation(req, res, next) {
        var newAnnotationData = req.body,
            date = new Date(),
            user = req.user? req.user:{},
            firstName = user.firstName? user.firstName:"",
            lastName = user.lastName? user.lastName:"";

        newAnnotationData.annotationId = 'ANN_ID_' + date.getTime();
        newAnnotationData.id = newAnnotationData.annotationId;
        newAnnotationData.ciId = req.params.ciId;
        newAnnotationData.page = req.params.pageNum;
        newAnnotationData.user = firstName+ " "+lastName;
        newAnnotationData.createdUser = firstName+ " "+lastName;
        newAnnotationData.createdUserID = user._id;

        if(!newAnnotationData.customFields){
            newAnnotationData.customFields = {};
        }
        newAnnotationData.customFields.markedUser = firstName+ " "+lastName;

        //    newAnnotationData.createdDate = date;
        //    newAnnotationData.updatedDate = date;
        newAnnotationData.recordStatus = 0; //0 means active, 1 means deleted

        Annotation.createCustom({user: req.user, doc:newAnnotationData}, function (err, annotation) {
            if (err) {
                if (err.toString().indexOf('E11000') > -1) {
                    err = new Error('Duplicate Annotation.');
                }

                res.status(400);
                return res.send({
                    reason: err.toString()
                });
            }
            //return the new annotation..
            res.send(annotation);
        });
    };

    /**
     * Used to update an annotation
     *
     * @param req
     * @param res
     */
    function updateAnnotation(req, res) {
        var annotationData = req.body,
            _id = annotationData.id,
            date = new Date(),
            query = {
                id: _id,
                annotationId: _id,
                recordStatus: 0
            },
            user = req.user? req.user:{},
            firstName = user.firstName? user.firstName:"",
            lastName = user.lastName? user.lastName:"";
        updates = {
            updatedUser: firstName+ " "+lastName,
            updatedUserID: user._id,
            text: annotationData.text? annotationData.text:"",
            category: annotationData.category,
            customFields: annotationData.customFields,
            customData: annotationData.customData,
            shapes: annotationData.shapes,
            reviewed: annotationData.reviewed
        };

        Annotation.findOneCustomAsync({user: req.user, query:query}).then(function(annotation) {
//            var custCat = updates.customFields && updates.customFields.category ? updates.customFields.category : null;

            annotation.updatedUser = updates.updatedUser;
            annotation.updatedUserID = updates.updatedUserID;
            annotation.updatedDate = date;
            if(typeof annotation.text ==="undefined" || annotation.text !== updates.text){
                annotation.text = updates.text;
            }
            if(typeof annotation.category ==="undefined" || annotation.category !== updates.category){
                annotation.category = updates.category;
                annotation.shapes = updates.shapes;
            }
//            if(typeof annotation.customFields !=="undefined" && (typeof annotation.customFields.category ==="undefined" || annotation.customFields.category !== custCat)){
//                annotation.customFields.category = custCat;
//            }
            if(annotation.customFields){
            	annotation.customFields.markedAsReviewedBeforeEndDate = updates.customFields.markedAsReviewedBeforeEndDate;
            	annotation.customFields.markedAsEndDated = updates.customFields.markedAsEndDated;
            	annotation.customFields.markedAsReviewedAfterEndDate = updates.customFields.markedAsReviewedAfterEndDate;
            }
            annotation.reviewed = updates.reviewed;

            annotation.customData = updates.customData;

            return annotation.saveAsync();
        }).then(function(obj) {
            logger.debug(obj,'updated');
            res.send(obj);
        }).catch(function(error) {
            return res.status(500).send({ error: error.toString() });
        });
    };

    /**
     * Used to delete an annotation
     *
     * @param req
     * @param res
     */
    function deleteAnnotation(req, res) {
        var _id = req.params.anId;

        var query = {
            id: _id,
            annotationId: _id
        };

        Annotation.findOneCustomAsync({user: req.user, query:query}).then(function(annotation) {

            // set recordStatus = 1 to delete
            annotation.recordStatus = 1;

            return annotation.saveAsync();
        }).then(function(obj) {
            logger.debug(obj,'updated');
            res.send(obj);
        }).catch(function(error) {
            return res.status(500).send({ error: error.toString() });
        });
    };

    return {
	getAnnotations: getAnnotations,
	getAnnotationsByPage: getAnnotationsByPage,
	getAnnotation: getAnnotation,
	findAnnotationsCountByCategory: findAnnotationsCountByCategory,
	createAnnotation: createAnnotation,
	updateAnnotation: updateAnnotation,
	deleteAnnotation: deleteAnnotation
    };
};
