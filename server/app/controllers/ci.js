/* jshint node:true */
'use strict';

var R = require('ramda');
var _ = require('lodash');
var moment = require('moment');
var moment_tz = require('moment-timezone');
var Promise = require('bluebird');
var constants = require('../../constants');
var _COMPANY = constants.COMPANY;
var _CI = constants.CI;
var masterDataCtrl = require('./masterdata');
var mailer = require('../../utilities/mailer');
var logger = require('../../utilities/logger');
var fs = require('fs');
var url = require('url');
var http = require('http');
var https = require('https');
var config = require('../config');
var MemoryCache = require('memory-cache');
var util = require('util');

////////////////////////////////////////////////////////////////////////////////

/*
 http://mongoosejs.com/docs/middleware.html

 Notes on findAndUpdate()

 `pre` and `post` are not called for update operations executed directly on the database, including `Model.update`,`.findByIdAndUpdate`,`.findOneAndUpdate`, `.findOneAndRemove`,and `.findByIdAndRemove`.order to utilize `pre` or `post` middleware, you should `find()` the document, and call the `init`, `validate`, `save`, or `remove` functions on the document. See [explanation](http://github.com/LearnBoost/mongoose/issues/964).
 */

////////////////////////////////////////////////////////////////////////////////

var STALE_CI_DATA_ERROR_MESSAGE_NEWQ = "This CI was changed since you opened it. When you click OK the CI will close. \nYou can open the CI again to view the updated version. If you do not see the CI you can find it in the Library.";

////////////////////////////////////////////////////////////////////////////////

var sendEmailNotifications = false; // CI related email notifications are off for now, and will be revisited post scenario testing

////////////////////////////////////////////////////////////////////////////////

module.exports = function (app) {

    ////
    var config = app.locals.config;
    var db = app.locals.db;
    ////
    var CI = db.CI;
    var Advertiser = db.AdvertiserBrand;
    var ParkingLot = db.ParkingLot;
    var SavedSearch = db.SavedSearch;
    ////

    var queries = {
        agency: {
            delivered: {
                status: _CI.STATUS.DELIVERED,
                stapled_to: {$exists: false},
                archived: {$exists: false}
            },
            now: {
                status: _CI.STATUS.IN_PROGRESS,
                stapled_to: {$exists: false},
                $or: [{possible_revision: true}, {pending_revision: true}, {uninstructed_match: true}, {stuck: true}],
                archived: {$exists: false}
            }, /*
             revision: {
             status: _CI.STATUS.IN_PROGRESS,
             stapled_to: { $exists: false },
             $or: [ { possible_revision: true }, { pending_revision: true } ],
             archived: { $exists: false }
             },
             stuck: {
             status: _CI.STATUS.IN_PROGRESS,
             stapled_to: { $exists: false },
             stuck: true,
             archived: { $exists: false }
             },
             uninstructed: {
             status: _CI.STATUS.IN_PROGRESS,
             stapled_to: { $exists: false },
             uninstructed_match: true,
             archived: { $exists: false }
             },
             stapled: {
             stapled: true,
             archived: { $exists: false }
             },
             */
            library: {
                stapled_to: {$exists: false},
                archived: {$exists: false},
                $and: [{
                    $or: [{status: _CI.STATUS.IN_PROGRESS}, {status: _CI.STATUS.COMPLETED}]
                }]
            }
            /*
             completed: {
             stapled_to: { $exists: false },
             status: _CI.STATUS.COMPLETED
             },
             archived: {
             archived: { $exists: true }
             },
             emails: {
             status: _CI.STATUS.EMAILS
             }
             */
        },
        media_company: {
            delivered: {
                status: _CI.STATUS.DELIVERED,
                stapled_to: {$exists: false},
                archived: {$exists: false}
            },
            now: {
                status: _CI.STATUS.IN_PROGRESS,
                stapled_to: {$exists: false},
                $or: [{possible_revision: true}, {pending_revision: true}, {uninstructed_match: true}, {stuck: true}],
                archived: {$exists: false}
            },
            revision: {
                status: _CI.STATUS.IN_PROGRESS,
                stapled_to: {$exists: false},
                $or: [{possible_revision: true}, {pending_revision: true}],
                archived: {$exists: false}
            },
            stuck: {
                status: _CI.STATUS.IN_PROGRESS,
                stapled_to: {$exists: false},
                stuck: true,
                archived: {$exists: false}
            },
            uninstructed: {
                status: _CI.STATUS.IN_PROGRESS,
                stapled_to: {$exists: false},
                uninstructed_match: true,
                archived: {$exists: false}
            },
            stapled: {
                stapled: true,
                archived: {$exists: false}
            },
            library: {
                stapled_to: {$exists: false},
                archived: {$exists: false},
                $and: [{
                    $or: [{status: _CI.STATUS.IN_PROGRESS}, {status: _CI.STATUS.COMPLETED}]
                }]
            },
            completed: {
                stapled_to: {$exists: false},
                status: _CI.STATUS.COMPLETED
            },
            archived: {
                archived: {$exists: true}
            },
            emails: {
                status: _CI.STATUS.EMAILS
            }
        }
    };

    ////////////////////////////////////////////////////////////////////////////////
    /*Node level memory cache for Library CIs*/
    //LIBRARY CIs
    function SetLibraryCache(userId, cis) {
        MemoryCache.put("LIBRARY_" + userId, cis);
    }

    function GetLibraryCache(userId) {
        return MemoryCache.get("LIBRARY_" + userId);
    }

    function ResetLibraryCache(userId) {
        MemoryCache.del("LIBRARY_" + userId);
    }

    //LIBRARY IGNORED CIs
    function SetLibraryIgnoredCache(userId, cis) {
        MemoryCache.put("LIBRARY_IGNORED_" + userId, cis);
    }

    function GetLibraryIgnoredCache(userId) {
        return MemoryCache.get("LIBRARY_IGNORED_" + userId);
    }

    function ResetLibraryIgnoredCache(userId) {
        MemoryCache.del("LIBRARY_IGNORED_" + userId);
    }

    ////////////////////////////////////////////////////////////////////////////////

    function getQuery(user, owners, queue) {

        var queries = getQueriesForUser(user);
        //logger.debug(queries,'queries');

        var query = _.clone(queries[queue]);
        windowQueryToUser(user, query);

        //Owner filters in queues
        if (owners.length > 0) {
            query.owner = {$in: owners};
        }

        return query;
    }

    function getQueriesForUser(user) {

        //TypeError: Cannot read property 'roles' of undefined
        if (typeof user === 'undefined') return;

        if (_.startsWith(user.roles, _COMPANY.TYPE.MEDIA_COMPANY)) {
            return queries.media_company
        }
        else if (_.startsWith(user.roles, _COMPANY.TYPE.AGENCY)) {
            return queries.agency;
        }
        else {
            // TODO kenmc
        }
    }

    function windowQueryToUser(user, query) {

        if (_.startsWith(user.roles, _COMPANY.TYPE.MEDIA_COMPANY)) {
            query.network = user.affiliation.metadata.active_network;
        }
        else if (_.startsWith(user.roles, _COMPANY.TYPE.AGENCY)) {
            query['ingest.sender'] = user.affiliation.ref_id;
        }
    }

    ////////////////////////////////////////////////////////////////////////////////

    function _find(query, select, sort, req, res) {

        //logger.debug(query,'query');

        var q = CI.findCustom({user: req.user, query: query});
        //logger.debug(q,'q');

        if (select) {
            q.select(select);
        }

        if (sort) {
            q.sort(sort);
        }

        q.execAsync()
            .then(function (cis) {
                //logger.debug(cis);
                return res.send(cis);
            })
            .catch(function (error) {
                logger.debug(error);
                return res.status(500).send({error: error.toString()});
            });
    }

    //this is used to get results for Library, set them in cache return the per page cis.
    function _findLibrary_cache(query, sort, offset, limit, req, res) {

        //these are the fields returned from DB

        var select = '_id advertiser brand program air_date_start air_date_end ingest status possible_revision ' +
            'pending_revision possibly_revised stuck uninstructed_match updated_at owner network type ' +
            'previous_status ' +
            'filed_at saved_at'; //for showing correct brand in the CI Card

        var q = CI.findCustom({user: req.user, query: query});
        if (select) {
            q.select(select);
        }

        if (sort) {
            q.sort(sort);
        }

        q.execAsync()
            .then(function (cis) {
                var data;
                //clear the old Library cache
                logger.debug('resetting library memory cache');
                ResetLibraryCache(req.user._id);
                //set the new library cache
                logger.debug('setting fresh library memory cache');
                SetLibraryCache(req.user._id, cis);
                data = {
                    cis: cis.slice(offset, offset + limit),
                    totalCount: cis.length
                };

                return res.send(data);
            })
            .catch(function (error) {
                logger.error(error, 'Error while finding library CIs per page.');
                return res.status(500).send({error: error.toString()});
            });
    }

    function _findLibrary_Ignored_cache(query, sort, offset, limit, req, res) {

        //these are the fields returned from DB
        var select = '_id advertiser brand program air_date_start air_date_end ingest status possible_revision ' +
            'pending_revision possibly_revised stuck uninstructed_match updated_at owner network type ' +
            'previous_status ignored_by_id ignored_at ' +
            'filed_at saved_at'; //for showing correct brand in the CI Card

        var q = CI.findCustom({user: req.user, query: query});
        if (select) {
            q.select(select);
        }

        if (sort) {
            q.sort(sort);
        }

        q.execAsync()
            .then(function (cis) {
                var data;
                //clear the old Library cache
                logger.debug('resetting library Ignored memory cache');
                ResetLibraryIgnoredCache(req.user._id);
                //set the new library cache
                logger.debug('setting fresh library Ignored memory cache');
                SetLibraryIgnoredCache(req.user._id, cis);
                data = {
                    cis: cis.slice(offset, offset + limit),
                    totalCount: cis.length
                };

                return res.send(data);
            })
            .catch(function (error) {
                logger.error(error, 'Error while finding library Ignored CIs per page.');
                return res.status(500).send({error: error.toString()});
            });
    }

    //this is called when we load the Library from any other queue
    function _findLibrary(query, req, res) {

        //'update_at' is needed for SortBy functionality!
        //'owner', 'network', 'type' are needed for Possible Revisions functionality!
        return _findLibrary_cache(query,
            '-updated_at',
            0, 50, req, res); //first page
    }

    function _findSorted(query, req, res) {

        //'update_at' is needed for SortBy functionality!
        //'owner', 'network', 'type' are needed for Possible Revisions functionality!
        return _find(query,
            '_id advertiser brand program air_date_start air_date_end ingest status possible_revision pending_revision possibly_revised stuck uninstructed_match updated_at owner network type filed_at saved_at',
            '-updated_at',
            req, res);
    }

    ////////////////////////////////////////////////////////////////////////////////

    function find(req, res) {

        return _find(null, req, res);
    }

    function findById(req, res) {

        var query = {_id: req.params.id};
        //logger.debug(query,'query');

        CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (cis) {
                logger.debug(cis, 'cis');
                return res.send(cis);
            })
            .catch(function (error) {
                logger.error(error, 'error');
                return res.status(500).send({error: error.toString()});
            });
    }

    /**
     * william for story: Authenticate users
     * have individual user accounts ("User accounts used to access NBCU data or NBCU information resources may not be shared.")
     */
    function findByIdAndUser(req, res) {
        //var networkNames = _.map(req.media_company_networks[1].networks, function (network) {return network.name;});

        var active_networks = null;
        for (var key in req.media_company_networks) {
            if (req.media_company_networks[key].indexOf(req.user.affiliation.metadata.active_network) !== -1) {
                active_networks = req.media_company_networks[key];
            }
        }

        var query = {
            _id: req.params.id,
            network: {$in: active_networks}
        };

        CI.findOneCustomAsync({user: req.user, query: query})
            .then(function (_ci) {
                return res.send(_ci);
            })
            .catch(function (error) {
                return res.status(500).send({error: error.toString()});
            });
    }

    // Deprecated version.
    function findByIdAndUser_old(req, res) {
        //var vicom_cid = '55333dc91bf9acd84e131e72';
        var user = req.user;
        masterDataCtrl
            ._getMediaCompanyById(user.affiliation.ref_id)
            .bind({})
            .then(function (mediaCompany) {

                return _.map(mediaCompany.networks, function (network) {
                    return network.name;
                });
            })
            .then(function (networkNames) {
                var query = {
                    _id: req.params.id,
                    network: {$in: networkNames}
                };
                CI
                    .findOneAsync(query)
                    .then(function (cis) {
                        if (!cis) {
                            return res.send(401, 'this cis can not be accessed.');
                        }
                        else {
                            return res.send(cis);
                        }
                    })
                    .catch(function (error) {
                        return res.status(500).send({error: error.toString()});
                    });
            })
            .catch(function (error) {
                return res.send('error generated ' + error.toString());
            });
    }

    function setStatus(req, res) {

        return _checkForCIVersion(req, res, handleSetStatus);

        function handleSetStatus() {
            var query = {_id: req.params.id};

            var prev_status;

            CI
                .findOneCustomAsync({user: req.user, query: query})
                .then(function (ci) {

                    //logger.debug(ci,'set_status::ci');

                    var value = req.body.value;

                    var match = R.contains(value)(R.values(_CI.STATUS));
                    if (!match) {
                        return res.status(400).send({error: 'Invalid status'});
                    }

                    if (ci.status === _CI.STATUS.DELIVERED) {

                        if (value !== _CI.STATUS.DELIVERED &&
                            value !== _CI.STATUS.IGNORED &&
                            value !== _CI.STATUS.IN_PROGRESS) {

                            return res.status(400).send({error: 'Invalid status change'});
                        }
                    }

                    prev_status = ci.status;

                    /*PavaiKa - new logic, for Ignored CIs*/
                    //set the previous_status value
                    ci.previous_status = prev_status;
                    //set the ignored_by_id, ignored_at if status is changing to ignored.
                    if (value === _CI.STATUS.IGNORED) {
                        ci.ignored_by_id = req.user._id;
                        ci.ignored_at = new moment();
                    } else {
                        ci.ignored_by_id = null;
                        ci.ignored_at = null;
                    }

                    //update the current status
                    ci.status = value;

                    /*//update the updatedUser & updated_by_id
                    ci.updatedUser = req.user.userName;
                    ci.updated_by_id = req.user._id;*/

                    return ci
                        .saveAsync();
                })
                .then(function (ci) {

                    //logger.debug(ci,'updated');
                    var _ci = _.isArray(ci) ? ci[0] : ci;
                    sendStatusChangeNotificationEmail(req.user, _ci, prev_status);
                    res.send(ci);
                })
                .catch(function (error) {
                    //logger.error(error,'set_status::error');
                    return res.status(500).send({error: error.toString});
                });
        }
    }


    function setNote(req, res) {

        var query = {_id: req.params.id};

        CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (ci) {

                var value = req.body.value;

                ci.note = value;

                //update the updatedUser & updated_by_id
                ci.updatedUser = req.user.userName;
                ci.updated_by_id = req.user._id;

                return ci
                    .saveAsync();
            })
            .then(function (ci) {

                //logger.debug(ci,'updated');
                var _ci = _.isArray(ci) ? ci[0] : ci;
                sendNoteChangedNotificationEmail(req.user, _ci);
                res.send(ci);
            })
            .catch(function (error) {
                return res.status(500).send({error: error.toString()});
            });
    }

    function setActive(req, res) {

        var query = {_id: req.params.id};

        CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (ci) {

                var value = req.body.value;

                ci.active = value;

                //update the updatedUser & updated_by_id
                ci.updatedUser = req.user.userName;
                ci.updated_by_id = req.user._id;

                return ci
                    .saveAsync();
            })
            .then(function (ci) {

                //logger.debug(ci,'updated');
                var _ci = _.isArray(ci) ? ci[0] : ci;
                sendActiveChangedNotificationEmail(req.user, _ci);
                res.send(ci);
            })
            .catch(function (error) {
                return res.status(500).send({error: error.toString()});
            });
    }

    function setRotation(req, res) {

        var query = {_id: req.params.id};

        CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (ci) {

                var value = req.body.value;

                ci.rotation = parseInt(value, 10);

                //update the updatedUser & updated_by_id
                ci.updatedUser = req.user.userName;
                ci.updated_by_id = req.user._id;

                return ci
                    .saveAsync();
            })
            .then(function (ci) {

                //logger.debug(ci,'updated');
                var _ci = _.isArray(ci) ? ci[0] : ci;
                // sendActiveChangedNotificationEmail(req.user, _ci);
                res.send(ci);
            })
            .catch(function (error) {
                return res.status(500).send({error: error.toString()});
            });
    }

    function updateOwner(req, res) {

        var query = {_id: req.params.id};

        CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (ci) {

                var _userName = req.body.userName;
                var _userId = req.body.userId;

                ci.owner = _userName;
                ci.owner_id = _userId;

                //update the updatedUser & updated_by_id
                ci.updatedUser = req.user.userName;
                ci.updated_by_id = req.user._id;

                return ci
                    .saveAsync();
            })
            .then(function (ci) {
                logger.debug(_ci, 'Owner is updated for CI: ' + req.params.id + ' to ' + req.body.value);
                var _ci = _.isArray(ci) ? ci[0] : ci;
                sendOwnerChangedNotificationEmail(req.user, _ci);
                res.send(ci);
            })
            .catch(function (error) {
                logger.debug(error, 'Error while updating the owner for  CI: ' + req.params.id + ' to ' + req.body.value + ', ERROR: ' + error.toString());
                return res.status(500).send({error: error.toString()});
            });
    }


    function findNew(req, res) {
        var owners = [];
        return _findSorted(getQuery(req.user, owners, 'delivered'), req, res);
    }

    function findNow(req, res) {
        var owners = [];
        return _findSorted(getQuery(req.user, owners, 'now'), req, res);
    }

    function findStapled(req, res) {
        var owners = [];
        return _findSorted(getQuery(req.user, owners, 'stapled'), req, res);
    }

    function findRevision(req, res) {
        var owners = [];
        return _findSorted(getQuery(req.user, owners, 'revision'), req, res);
    }

    function findStuck(req, res) {
        var owners = [];
        return _findSorted(getQuery(req.user, owners, 'stuck'), req, res);
    }

    function findUninstructed(req, res) {
        var owners = [];
        return _findSorted(getQuery(req.user, owners, 'uninstructed'), req, res);
    }

    function findLibrary(req, res) {
        var owners = [];
        //this is for library, first 50
        return _findLibrary(getQuery(req.user, owners, 'library'), req, res);
    }

    function findCompleted(req, res) {
        var owners = [];
        return _findSorted(getQuery(req.user, owners, 'completed'), req, res);
    }

    function findArchived(req, res) {
        var owners = [];
        return _findSorted(getQuery(req.user, owners, 'archived'), req, res);
    }

    function findEmails(req, res) {
        var owners = [];
        return _findSorted(getQuery(req.user, owners, 'emails'), req, res);
    }

    function counted(req, res) {

        //logger.debug('counted');
        //logger.debug(req.user,'req.user');

        var queryMap = {};

        // Dumb way to do this, but ok for now...

        var queries = getQueriesForUser(req.user);

        _.forEach(queries, function (query, key) {

            windowQueryToUser(req.user, query);

            if (key === 'delivered') {
                key = 'new';
            }

            if (key === 'in_progress') {
                key = 'now';
            }

            queryMap[key] = CI.countCustomAsync({user: req.user, query: query});
        });

        //START: Parking Lot Count
        queryMap.parkinglot = ParkingLot
            .findOneAsync({user_id: req.user ? req.user._id : 0}) //Cannot read property '_id' of undefined
            .then(function (parkinglot) {

                if (!parkinglot) {
                    return 0;
                }

                //check the cis for this network
                var cis_query = {
                    _id: {$in: parkinglot.cis},
                    network: req.user.affiliation.metadata.active_network //get only the CI's for this network!
                };

                return CI.countAsync(cis_query);
            })
            .catch(function (error) {
                logger.debug(error, 'Error in getting the Parkinglot count!');
                return 0;
            });
        //END: Parking Lot Count

        //START: Saved Searches
        var qrySearch = {
            user_id: req.user ? req.user._id : 0 //TypeError: Cannot read property '_id' of undefined]
        };
        queryMap.saved_searches = SavedSearch
            .find(qrySearch)
            .select({_id: 0, name: 1, search_id: 1})
            .sort({'updated_at': -1})
            .execAsync()
            .then(function (searches) {

                /*return _.map(searches, function(search) {
                 return _.pick(search, ['name', 'search_id']);
                 });*/

                /*
                 if (searches.length == 0) {
                 searches.push({'name': "Harvey's saved search 1", 'search_id': 'SEARCH_ID_1'});
                 searches.push({'name': "Hershey's 2014", 'search_id': 'SEARCH_ID_2'});
                 searches.push({'name': "August 2015 Big Bang Theory CIs only", 'search_id': 'SEARCH_ID_3'});
                 }
                 */

                return searches;
            })
            .catch(function (error) {
                logger.debug(error, 'Error in getting the saved searches!');
                return [];
            });
        //END: Saved Searches

        Promise
            .props(queryMap)
            .then(function (result) {
                return res.send(result);
            })
            .catch(function (error) {
                return res.status(500).send({error: error.toString()});
            });
    }

    function countsForOwners(req, res) {
        var _owners = req.body;

        var queryMap = {};

        // Dumb way to do this, but ok for now...
        var queries = getQueriesForUser(req.user);

        _.forEach(queries, function (query, key) {
            var _query = _.clone(query);

            windowQueryToUser(req.user, _query);

            if (key === 'delivered') {
                key = 'new';
            }

            if (key === 'in_progress') {
                key = 'now';
            }

            //Owner filters in queues
            if (_owners.length > 0 && key !== 'new') {
                _query.owner = {$in: _owners};
            }

            queryMap[key] = CI.countCustomAsync({user: req.user, query: _query});
        });

        //START: Parking Lot Count
        queryMap.parkinglot = ParkingLot
            .findOneAsync({user_id: req.user ? req.user._id : 0}) //Cannot read property '_id' of undefined
            .then(function (parkinglot) {

                if (!parkinglot) {
                    return 0;
                }

                //check the cis for this network
                var cis_query = {
                    _id: {$in: parkinglot.cis},
                    network: req.user.affiliation.metadata.active_network //get only the CI's for this network!
                };

                /*if(_owners.length > 0) {
                 cis_query.owner = { $in: _owners }; //Owner filters in queues
                 }*/


                return CI.countAsync(cis_query);
            })
            .catch(function (error) {
                logger.debug(error, 'Error in getting the Parkinglot count!');
                return 0;
            });
        //END: Parking Lot Count

        //START: Saved Searches
        var qrySearch = {
            user_id: req.user ? req.user._id : 0 //TypeError: Cannot read property '_id' of undefined]
        };
        queryMap.saved_searches = SavedSearch
            .find(qrySearch)
            .select({_id: 0, name: 1, search_id: 1})
            .sort({'updated_at': -1})
            .execAsync()
            .then(function (searches) {
                /*return _.map(searches, function(search) {
                 return _.pick(search, ['name', 'search_id']);
                 });*/
                //this is
                if (searches.length == 0) {
                    searches.push({'name': "Harvey's saved search 1", 'search_id': 'SEARCH_ID_1'});
                    searches.push({'name': "Hershey's 2014", 'search_id': 'SEARCH_ID_2'});
                    searches.push({'name': "August 2015 Big Bang Theory CIs only", 'search_id': 'SEARCH_ID_3'});
                }

                return searches;
            })
            .catch(function (error) {
                logger.debug(error, 'Error in getting the saved searches!');
                return [];
            });
        //END: Saved Searches

        Promise
            .props(queryMap)
            .then(function (result) {
                if (result) {
                    result.network = req.user.affiliation.metadata.active_network;
                }
                return res.send(result);
            })
            .catch(function (error) {
                return res.status(500).send({error: error.toString()});
            });
    }

    function fetchPdf(req, res) {

        var ciId = req.params.ci_id;
        var type = req.params.type;

        var query = {_id: req.params.id};

        CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (cis) {

                var ci = cis;
                var url = ci.ingest.files.common ? ci.ingest.files.common.url : null;

                var options = {
                    path: pdfFile,
                    headers: {
                        'Content-Type': file_type
                    }
                };
                if (/^https/i.test(file_protocol)) {
                    options.host = file_url;
                    https.get(options, function (result) {
                        var chunks = [];

                        result.on('data', function (chunk) {

                            chunks.push(chunk);

                        }).on('end', function () {

                            res.status(200).send(Buffer.concat(chunks));

                        }).on('error', function (error) {

                            res.send(error);
                        });
                    });

                }
                else {
                    options.host = file_url;
                    http.get(options, function (result) {
                        var chunks = [];

                        result.on('data', function (chunk) {

                            chunks.push(chunk);

                        }).on('end', function () {

                            res.status(200).send(Buffer.concat(chunks));

                        }).on('error', function (error) {

                            res.send(error);
                        });
                    });

                }
            })
            .catch(function (error) {
                logger.error(error, 'error');
                return res.status(500).send({error: error.toString()});
            });

    }

    // keep for a while until stable
    function fetchPdf1(req, res) {

        //https://trafficbridge-ingestion-dev.s3.amazonaws.com/2c3ee60d-9a38-4d61-8bf0-674563475596.pdf"
        // var ingestUrl = "https://trafficbridge-ingestion-dev.s3.amazonaws.com/";
        var pdfFile = '/' + req.params.pid + ".pdf";
        var file_type = req.params.type;
        var file_protocol = req.params.protocol;
        var file_url = req.params.url;
        var options = {
            path: pdfFile,
            headers: {
                'Content-Type': file_type
            }
        };
        if (/^https/i.test(file_protocol)) {
            options.host = file_url;
            https.get(options, function (result) {
                var chunks = [];

                result.on('data', function (chunk) {

                    chunks.push(chunk);

                }).on('end', function () {

                    res.status(200).send(Buffer.concat(chunks));

                }).on('error', function (error) {

                    res.send(error);
                });
            });

        }
        else {
            options.host = file_url;
            http.get(options, function (result) {
                var chunks = [];

                result.on('data', function (chunk) {

                    chunks.push(chunk);

                }).on('end', function () {

                    res.status(200).send(Buffer.concat(chunks));

                }).on('error', function (error) {

                    res.send(error);
                });
            });

        }
    }

    function queueForOwners(req, res) {
        var owners = req.body.owners;
        var queue = req.body.queue;

        if (queue === 'new') {
            queue = 'delivered';
            owners = []; //new queue is for all users
        }

        if (queue === 'parkinglot') {
            queue = 'in_progress';
        }

        return _findSorted(getQuery(req.user, owners, queue), req, res);
    }

    function _checkForCIVersion(req, res, cb) {
        var query = {
            _id: req.params.id
        };

        CI.findOneCustomAsync({user: req.user, query: query})
            .then(function (_ci) {
                if (!_ci) {
                    return res.status(500).send({error: "CI not found with ID: " + req.params.id});
                }
                var ciFromReq = req.body;
                if (typeof ciFromReq.__docVersion === "number") {
                    if (ciFromReq.__docVersion < _ci.__docVersion) {
                        return res.status(500).send({
                            errorType: "StaleDataError",
                            message: STALE_CI_DATA_ERROR_MESSAGE_NEWQ
                        });
                    } else {
                        return cb();
                    }
                } else {
                    return cb();
                }
            })
            .catch(function (error) {
                return res.status(500).send({error: error.toString()});
            });
    }

    function update(req, res) {

        var ci = req.body;

        var query = {
            advertiser: ci.advertiser
        };

        return _checkForCIVersion(req, res, handleUpdate);

        function handleUpdate() {
            return Advertiser
                .findOneAsync(query)
                .then(function (advertiser) {

                    logger.debug(advertiser, 'advertiser');
                    logger.debug(advertiser.files_by_brand, 'advertiser.files_by_brand');
                    logger.debug(advertiser.files_by_program, 'advertiser.files_by_program');

                    var prev_status = ci.status;
                    var SKIP_POSSIBLE_REVISIONS_CHECK = false;

                    if (ci.status === _CI.STATUS.DELIVERED ||
                        ci.status === _CI.STATUS.EMAILS) { // EMAILS is temporary until the Email Queue is gone

                        if (!_.isUndefined(ci.network) && !_.isUndefined(ci.advertiser) &&
                            (advertiser.files_by_brand ? !_.isUndefined(ci.brand) : true) &&
                            (advertiser.files_by_program ? !_.isUndefined(ci.program) : true) && !_.isUndefined(ci.type) && !_.isUndefined(ci.air_date_start) && !_.isUndefined(ci.air_date_end)) {

                            //CI needs to be filed only when the below conditions are met. Otherwise just save metadata.
                            //Owner of the CI is the current logged in User
                            if (ci.owner != null && ci.owner === req.user.userName) {

                                ci.status = _CI.STATUS.IN_PROGRESS;
                                // Only set filed_at/by once, the first time kenmc
                                if (!ci.filed_at) {
                                    ci.filed_at = new moment();
                                    ci.filed_by = req.user.userName;
                                    ci.filed_by_id = req.user._id;
                                }
                            } else {
                                SKIP_POSSIBLE_REVISIONS_CHECK = true;
                                //This is used in the CI Modal to
                                //determine the 'brandSlot' value for UI.
                                ci.saved_at = new moment();
                                ci.saved_by_id = req.user._id;
                            }
                        }
                        else {

                            return res.status(500).send({error: 'Missing required metadata.'});
                        }
                    } else if (ci.status === _CI.STATUS.IGNORED) {
                        //Ignored CIs should not be checked for possible revision logic!
                        SKIP_POSSIBLE_REVISIONS_CHECK = true;

                        //update the updatedUser & updated_by_id
                        ci.updatedUser = req.user.userName;
                        ci.updated_by_id = req.user._id;
                    } else {

                        //update the updatedUser & updated_by_id
                        ci.updatedUser = req.user.userName;
                        ci.updated_by_id = req.user._id;

                    }

                    //TODO:
                    if (SKIP_POSSIBLE_REVISIONS_CHECK === true) {

                        //update the CI
                    } else {

                        //1. find pending possible revisions

                        //2. no pending possible revisions, update possible_revision flag of this CI
                    }

                    //findPossibleRevisions(ci)
                    _find_possible_revisions(ci, req.user.userName, req)
                        .then(function (cis) {

                            var promises = [];
                            //we are finding possible revisions anyway, so check if we need to set the 'possible_revision' flag!
                            if (!SKIP_POSSIBLE_REVISIONS_CHECK) {
                                var notEmpty = (!_.isEmpty(cis));

                                logger.debug(notEmpty, 'notEmpty');

                                if (notEmpty) {
                                    //1. possible_revision flag for this CI
                                    ci.possible_revision = true;

                                    //2. possibly_revised flag for the matching CIs.
                                    _.forEach(cis, function (_ci) {
                                        promises.push(
                                            _set_CI_flag(_ci._id, 'POSSIBLY_REVISED', true, req)
                                                .then(function (ci) {

                                                    logger.debug("POSSIBLY_REVISED flag has been set to TRUE for CI " + _ci._id);
                                                })
                                                .catch(function (error) {

                                                    logger.error(error);
                                                    return res.status(500).send({error: error.toString()});
                                                })
                                        );
                                    });

                                }
                                //logger.debug(ci, 'ci');
                            }

                            //this is to make sure that we are updating the possibly_revised flag on the candidate(s)
                            //before updating the possible_revision flag on the revision. Otherwise candidate will be
                            //shown before the revision in the UI Queues.
                            return Promise.all(promises).then(function () {
                                logger.debug("all notes are updated!");
                                return CI
                                    .findOneAsync({
                                        _id: ci._id
                                    });
                            });
                        })
                        .then(function (_ci) {

                            logger.debug(_ci, '_ci');

                            _ci.merge(ci);

                            logger.debug(_ci, '_ci');

                            return _ci
                                .saveAsync();
                        })
                        .then(function (rv) {

                            if (ci.status != prev_status) {
                                sendStatusChangeNotificationEmail(req.user, ci, prev_status);
                            }
                            return res.send(rv);
                        })
                        .catch(function (error) {

                            logger.error(error);
                            return res.status(500).send({error: error.toString()});
                        });
                })
                .catch(function (error) {

                    logger.error(error);
                    return res.status(500).send({error: error.toString()});
                });
        }
    }

    function possibleRevisions(req, res) {

        var ci_id = req.params.id;

        var query = {_id: req.params.id};

        CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (ci) {

                //return findPossibleRevisions(ci);
                return _find_possible_revisions(ci, req.user.userName, req);
            })
            .then(function (cis) {

                res.send(cis);
            })
            .catch(function (error) {

                return res.status(500).send({error: error.toString()});
            });
    }

    function staple(req, res) {

        var ci_id = req.params.id;
        var ci_ids = req.body;

        logger.debug(ci_ids, 'staple::ci_ids');

        var all_ci_ids = _.flatten([ci_id, ci_ids]);
        logger.debug(all_ci_ids, 'staple::all_ci_ids');

        var query = {_id: {$in: all_ci_ids}};

        CI
            .findCustomAsync({user: req.user, query: query})
            .bind({})
            .then(function (cis_to_staple) {

                this.cis_to_staple = cis_to_staple;

                this.ci = cis_to_staple[0]; // Choose one, since they all have the same metadata

                logger.debug(cis_to_staple, 'staple::cis_to_staple');

                var air_date_start = moment.min(_.map(cis_to_staple, function (ci) {
                    return new moment(ci.air_date_start);
                }));
                var air_date_end = moment.max(_.map(cis_to_staple, function (ci) {
                    return new moment(ci.air_date_end);
                }));
                var uninstructed_match = _.any(cis_to_staple, function (ci) {
                    return ci.uninstructed_match
                });
                var stuck = _.any(cis_to_staple, function (ci) {
                    return ci.stuck
                });

                var cis = _.map(all_ci_ids, function (ci_id) {
                    return {
                        ci_id: ci_id,
                        created_at: new moment()
                    };
                });

                var new_staple_ci = {
                    network: this.ci.network,
                    advertiser: this.ci.advertiser,
                    brand: this.ci.brand,
                    program: this.ci.program,
                    type: this.ci.type,
                    air_date_start: air_date_start,
                    air_date_end: air_date_end,
                    status: _CI.STATUS.IN_PROGRESS,
                    pending_revision: true,
                    uninstructed_match: uninstructed_match,
                    stuck: stuck,
                    staple: cis
                };

                logger.debug(new_staple_ci, 'staple::new_staple_ci');

                return CI
                    .createAsync(new_staple_ci);
            })
            .then(function (staple_ci) {

                this.staple_ci = staple_ci;

                logger.debug(staple_ci, 'staple::staple_ci');
                logger.debug(all_ci_ids, 'staple::all_ci_ids');

                return CI.
                    updateAsync({_id: {$in: all_ci_ids}},
                    {
                        possible_revision: false,
                        stapled_to: staple_ci._id
                    },
                    {multi: true});
            })
            .then(function (updated_cis) {

                logger.debug(updated_cis, 'ci::updated_cis');
                res.send(this.staple_ci);
            })
            .catch(function (error) {

                logger.error(error, 'error');
                return res.status(500).send({error: error.toString()});
            });
    }

    function getStapledCIs(req, res) {

        var ci_id = req.params.id;

        var query = {_id: ci_id};

        CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (ci) {

                logger.debug(ci, 'ci');

                if (!ci.staple) {
                    return [];
                }

                var stapled_ci_ids = _.map(ci.staple, function (staple) {
                    return staple.ci_id;
                });
                var query2 = {_id: {$in: stapled_ci_ids}};

                //sort CIs in their created order, latest one first!
                return CI
                    .find(query2)
                    .sort('-created_at')
                    .execAsync();
            })
            .then(function (stapled_cis) {

                logger.debug(stapled_cis, 'stapled_cis');
                return res.send(stapled_cis);
            })
            .catch(function (error) {

                logger.error(error, 'error');
                return res.status(500).send({error: error.toString()});
            });
    }

    function assembleQuery(criteria, keyword, query) {

        if (criteria.length > 0) {

            if (!query.$and) {
                query.$and = [];
            }

            var _aQuery = [];

            _.forEach(criteria, function (c) {

                var _name = c.name;
                var _value = c.value;
                var _obj = {};
                _obj[keyword] = _value;

                _aQuery.push(_obj);
            });

            query.$and.push({
                '$or': _aQuery
            });
        }
        //else {
        //PavaniKa: This is not needed here, as this is repeating for each 'assembleQuery' call
        /*//none of the statuses selected, so defaults to these 3 statuses!
         if (!query.$and) {
         query.$and = [];
         }
         query.$and.push({
         $or: [{status: _CI.STATUS.IN_PROGRESS}, {status: _CI.STATUS.COMPLETED}]
         });*/
        //}
    }


    function searchIgnoredCIs(req, res) {

        var searchCriteria = req.body;
        var data = {};

        /*PavaniKa - Library Performance changes*/
        var _pagination = searchCriteria.pagination;
        var _offset = _pagination.PAGE_OFFSET;
        var _limit = _pagination.PAGE_LIMIT;
        var _ignoredByChanged = _pagination.IGNORED_BY_CHANGED;
        var _sortChanged = _pagination.SORTBY_CHANGED;
        var sort = searchCriteria.sort;

        var query;

        //only hit DB when something is changed in Filters or SortBy
        if (_ignoredByChanged || _sortChanged) {
            logger.debug('getting Library Ignored cis from DB:');
            //default search criteria for library
            query = {
                stapled_to: {$exists: false},
                archived: {$exists: false}
            };
            windowQueryToUser(req.user, query);
            //status will be 'ignored'
            query.status = _CI.STATUS.IGNORED;
            var ignoredByUsers = searchCriteria.ignoredBy;
            if (ignoredByUsers.length > 0) {
                //Ignored By these users
                assembleQuery(ignoredByUsers, 'ignored_by_id', query);
            }

            logger.debug(JSON.stringify(query), 'Library Ignored Search Query:');
            return _findLibrary_Ignored_cache(query, sort, _offset, _limit, req, res);
        }
        else {
            logger.debug('getting Library Ignored y cis from cache:');
            var cis = GetLibraryIgnoredCache(req.user._id);

            if (cis && cis instanceof Array) {
                data.totalCount = cis.length;
                data.cis = cis.slice(_offset, _offset + _limit);
            }
            else {
                //something went wrong, trigger fresh DB query
                query = {
                    stapled_to: {$exists: false},
                    archived: {$exists: false}
                };
                windowQueryToUser(req.user, query);
                //status will be 'ignored'
                query.status = _CI.STATUS.IGNORED;
                var ignoredByUsers = searchCriteria.ignoredBy;
                if (ignoredByUsers.length > 0) {
                    //Ignored By these users
                    assembleQuery(ignoredByUsers, 'ignored_by_id', query);
                }

                logger.debug(JSON.stringify(query), 'Library Ignored Search Query fallback case:');
                return _findLibrary_Ignored_cache(query, sort, _offset, _limit, req, res);
            }

            return res.send(data);
        }
    }

    function search(req, res) {

        var searchCriteria = req.body;
        var data = {};

        /*PavaniKa - Library Performance changes*/
        var _pagination = searchCriteria.pagination;
        var _offset = _pagination.PAGE_OFFSET;
        var _limit = _pagination.PAGE_LIMIT;
        var _filtersChanged = _pagination.FILTERS_CHANGED;
        var _sortChanged = _pagination.SORTBY_CHANGED;
        var _savedSearch = _pagination.SAVED_SEARCH || false; //true only when we load the saved search from left nav
        var sort = searchCriteria.sort;

        var query;

        //only hit DB when something is changed in Filters or SortBy
        if (_filtersChanged || _sortChanged || _savedSearch) {
            logger.debug('getting Library cis from DB:');

            query = _makeSearchQuery(req);
            logger.debug(JSON.stringify(query), 'Library Search Query:');

            return _findLibrary_cache(query, sort, _offset, _limit, req, res);
        }
        /*else if (_sortChanged) {
         //sort is changed, just sort them. No need to hit DB

         } */
        else {
            logger.debug('getting Library cis from cache:');
            var cis = GetLibraryCache(req.user._id);

            if (cis && cis instanceof Array) {
                data.totalCount = cis.length;
                data.cis = cis.slice(_offset, _offset + _limit);
            }
            else {
                //something went wrong, trigger fresh DB query
                query = _makeSearchQuery(req);
                logger.debug(JSON.stringify(query), 'Library Search Query in fallback case:');
                return _findLibrary_cache(query, sort, _offset, _limit, req, res);
            }

            return res.send(data);
        }
    }

    function _makeSearchQuery(req) {
        var searchCriteria = req.body;

        //default search criteria for library
        var query = {
            stapled_to: {$exists: false},
            archived: {$exists: false}
        };
        //var query = queries.library;

        windowQueryToUser(req.user, query);

        //Air Dates
        if (searchCriteria.airDates.length > 0) {
            var airDates = searchCriteria.airDates[0];

            /*Pivotal Bug# 92529702 - Filter Should show any CI where air dates overlap the selected dates*/
            //query.air_date_start =  {$gte: airDates.air_date_start };
            //query.air_date_end =  {$lte: airDates.air_date_end };
            query.air_date_start = {$lte: airDates.air_date_end};
            query.air_date_end = {$gte: airDates.air_date_start};
        }

        //advertisers
        //brands
        //programs

        assembleQuery(searchCriteria.advertisers, 'advertiser', query);
        if (searchCriteria.advertisers.length > 0) {
            assembleQuery(searchCriteria.brands, 'brand', query);
        }
        else {
            searchCriteria.brands.length = 0;
        }
        assembleQuery(searchCriteria.programs, 'program', query);
        assembleQuery(searchCriteria.owners, 'owner', query);

        //statuses
        if (searchCriteria.statuses.length > 0) {

            if (!query.$and) {
                query.$and = [];
            }

            var _statusQuery = [];

            _.forEach(searchCriteria.statuses, function (status) {

                var _statusName = status.name;
                var _statusValue = status.value;

                _statusQuery.push({
                    status: _statusValue
                })
            });

            query.$and.push({
                '$or': _statusQuery
            });
        }

        //types
        if (searchCriteria.types.length > 0) {

            if (!query.$and) {
                query.$and = [];
            }

            var _typeQuery = [];

            _.forEach(searchCriteria.types, function (type) {

                var _typeName = type.name;
                var _typeValue = type.value;

                _typeQuery.push({
                    type: _typeValue
                });
            });

            query.$and.push({
                '$or': _typeQuery
            });
        }

        //conditions
        if (searchCriteria.conditions.length > 0) {

            if (!query.$and) {
                query.$and = [];
            }

            var _conditionQry = [];

            _.forEach(searchCriteria.conditions, function (condition) {

                var _conditionName = condition.name;
                var _conditionValue = condition.value;

                switch (_conditionValue) {
                    case _CI.CONDITION.REVISION:
                        _conditionQry.push({
                            status: _CI.STATUS.IN_PROGRESS,
                            stapled_to: {$exists: false},
                            $or: [{possible_revision: true}, {pending_revision: true}],
                            archived: {$exists: false}
                        });
                        break;
                    case _CI.CONDITION.STUCK:
                        _conditionQry.push({
                            status: _CI.STATUS.IN_PROGRESS,
                            stapled_to: {$exists: false},
                            stuck: true,
                            archived: {$exists: false}
                        });
                        break;
                    case _CI.CONDITION.MATCH:
                        _conditionQry.push({
                            status: _CI.STATUS.IN_PROGRESS,
                            stapled_to: {$exists: false},
                            uninstructed_match: true,
                            archived: {$exists: false}
                        });
                        break;
                    case _CI.CONDITION.NEEDS_REVIEW:
                        _conditionQry.push({
                            status: _CI.STATUS.IN_PROGRESS,
                            stapled_to: {$exists: false},
                            notReviewed: true,
                            markedAsApplied: true,
                            archived: {$exists: false}
                        });
                        break;
                }
            });

            //william: notice capitalize, lowerCase.
            if (_conditionQry.length > 0) {
                query.$and.push({
                    '$or': _conditionQry
                });
            }
        }

        //Only include these statuses if none of the STATUS & CONDITIONS are selected!
        if (searchCriteria.conditions.length <= 0 && searchCriteria.statuses.length <= 0) {

            //none of the statuses selected, so defaults to these 3 statuses!
            if (!query.$and) {
                query.$and = [];
            }

            query.$and.push({
                $or: [{status: _CI.STATUS.IN_PROGRESS}, {status: _CI.STATUS.COMPLETED}]
            });
        }

        return query;
    }

    function saveSearch(req, res) {

        var saveCriteria = req.body;

        //User ID and Unique Search ID
        saveCriteria.user_id = req.user._id;
        saveCriteria.search_id = 'SEARCH_ID_' + new Date().getTime();

        //Air Dates
        if (saveCriteria.query.airDates && saveCriteria.query.airDates.length > 0) {
            var airDates = saveCriteria.query.airDates[0];

            saveCriteria.query.air_date_start = airDates.air_date_start;
            saveCriteria.query.air_date_end = airDates.air_date_end;
        }

        //logger.debug(JSON.stringify(saveCriteria), 'Save Search Criteria: ');

        SavedSearch // TODO async
            .create(saveCriteria, function (err, savedSearch) {

                if (err) {

                    if (err.toString().indexOf('E11000') > -1) {
                        err = new Error('Duplicate Search Name.');
                    }
                    logger.error(err.toString(), 'Save Search failed.');

                    res.status(400);
                    return res.send({
                        reason: err.toString()
                    });
                }

                logger.debug('Save Search is successful!');
                //return the new search info..
                res.send(savedSearch);
            });
    }

    function deleteSearch(req, res) {

        var payload = req.body;

        var query = {
            search_id: payload.searchId
        };

        logger.debug(query, 'Delete Search: ');

        SavedSearch // TODO async
            .findOneAndRemove(query, function (err, search) {

                if (err) {

                    if (err.toString().indexOf('E11000') > -1) {
                        err = new Error('Search not found.');
                    }

                    logger.error(err.toString(), 'Delete Search failed.');

                    res.status(400);
                    return res.send({
                        reason: err.toString()
                    });
                }

                logger.debug('Delete Search is successful!');
                //return the new search info..
                res.send(search);
            });
    }

    function getSavedSearches(req, res) {

        var query = {
            user_id: req.user._id
        };

        SavedSearch
            .findAsync(query)
            .then(function (searches) {

                logger.debug(searches, 'Saved Searches: ');

                res.send(searches);
            })
            .catch(function (error) {

                logger.error(error, 'Error while getting saved searches');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function getSavedSearchById(req, res) {

        var query = {
            user_id: req.user._id,
            search_id: req.params.id
        };

        SavedSearch
            .findOneAsync(query)
            .then(function (searchCriteria) {

                logger.debug(searchCriteria, 'Saved Search by ID: ');

                res.send(searchCriteria);
            })
            .catch(function (error) {

                logger.error(error, 'Error while getting saved search by ID');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function history(req, res) {

        var query = {_id: req.params.id};
        //logger.debug(query,'query');

        CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (ci) {

                /*
                 ci.historicalDetails(new Date(),function(e,objs) {
                 return res.send(objs);
                 });
                 */
                return res.send([]);
            })
            .catch(function (error) {
                logger.error(error, 'error');
                return res.send({error: error.toString()});
            });
    }

    function getParkingLot(req, res) {

        var query = {user_id: req.user._id};
        //logger.debug(query,'query');

        ParkingLot
            .findOneAsync(query)
            .then(function (parkinglot) {

                logger.debug(parkinglot, 'parkinglot');

                return res.send(parkinglot);
            })
            .catch(function (error) {

                logger.error(error, 'error');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function getParkingLotCIs(req, res) {

        var query = {user_id: req.user._id};
        //logger.debug(query,'query');

        ParkingLot
            .findOneAsync(query)
            .then(function (parkinglot) {

                logger.debug(parkinglot, 'parkinglot');

                if (!parkinglot) {
                    return [];
                }

                var cis_query = {
                    _id: {$in: parkinglot.cis},
                    network: req.user.affiliation.metadata.active_network //get only the CI's for this network!
                };

                return CI
                    .findCustom({user: req.user, query: cis_query})
                    .sort('-updated_at')
                    .execAsync();
            })
            .then(function (cis) {

                logger.debug(cis, 'cis');

                res.send(cis);
            })
            .catch(function (error) {

                logger.error(error, 'error');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function addToParkingLot(req, res) {

        var query = {user_id: req.user._id};
        //logger.debug(query,'query');

        ParkingLot
            .findOneAsync(query)
            .then(function (parkinglot) {

                logger.debug(parkinglot, 'parkinglot');

                var cis;

                if (!parkinglot) {

                    parkinglot = new ParkingLot({
                        user_id: req.user._id,
                        cis: [
                            req.params.ci_id
                        ]
                    });
                }
                else {

                    cis = parkinglot.cis.slice(0);
                    cis.push(req.params.ci_id);
                    parkinglot.cis = _.uniq(cis);
                }

                logger.debug(parkinglot, 'parkinglot');

                return parkinglot
                    .saveAsync();
            })
            .then(function (parkinglot) {

                logger.debug(parkinglot, 'parkinglot');
                res.send({ok: 1});
            })
            .catch(function (error) {

                logger.error(error, 'error');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function removeFromParkingLot(req, res) {

        var query = {user_id: req.user._id};
        //logger.debug(query,'query');

        ParkingLot
            .findOneAsync(query)
            .then(function (parkinglot) {

                //logger.debug(parkinglot,'parkinglot');

                if (parkinglot) {

                    parkinglot.cis = _.filter(parkinglot.cis, function (ci_id) {
                        return ci_id.toString() !== req.params.ci_id;
                    });
                    //logger.debug(parkinglot,'parkinglot');

                    parkinglot.markModified('cis');

                    return parkinglot
                        .saveAsync();
                }
                else {
                    return -1; // TODO kenmc
                }
            })
            .then(function (parkinglot) {

                logger.debug(parkinglot, 'parkinglot');
                res.send({ok: 1});
            })
            .catch(function (error) {

                logger.error(error, 'error');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    ////////////////////////////////////////////////////////////////////////////////

    function sendStatusChangeNotificationEmail(user, ci, prev_status) {

        if (sendEmailNotifications) {

            var text = '';
            text += 'The following Copy Instruction had it\'s status changed from <b>' + prev_status + '</b> to <b>' + ci.status + '</b>';
            text += "<br/>";
            text += "<br/>";
            text += 'Network: ' + (ci.network ? ci.network : '---');
            text += "<br/>";
            text += 'Advertiser: ' + (ci.advertiser ? ci.advertiser : '---');
            text += "<br/>";
            text += 'Brand: ' + (ci.brand ? ci.brand : '---');
            text += "<br/>";
            text += 'Air Dates: ' + moment(ci.air_date_start).format('MM/DD/YYYY') + ' - ' + moment(ci.air_date_end).format('MM/DD/YYYY');
            text += "<br/>";
            text += "<br/>";
            text += config.APP_URL + '/cc/metadata/' + ci._id;

            var html = text;

            //logger.debug(user,'sending');

            // TODO - handle email error
            mailer.sendNotificationMail(user.userName, text, html, function (error, info) {

                if (error) {
                    logger.error(error, 'error');
                }
                else {
                    logger.debug(info, 'Message sent');
                }
            });
        }
    }

    function sendNoteChangedNotificationEmail(user, ci) {

        if (sendEmailNotifications) {

            var text = '';
            text += 'The following Copy Instruction had it\'s note changed to <b>' + ci.note;
            text += "<br/>";
            text += "<br/>";
            text += 'Network: ' + (ci.network ? ci.network : '---');
            text += "<br/>";
            text += 'Advertiser: ' + (ci.advertiser ? ci.advertiser : '---');
            text += "<br/>";
            text += 'Brand: ' + (ci.brand ? ci.brand : '---');
            text += "<br/>";
            text += 'Air Dates: ' + moment(ci.air_date_start).format('MM/DD/YYYY') + ' - ' + moment(ci.air_date_end).format('MM/DD/YYYY');
            text += "<br/>";
            text += "<br/>";
            text += config.APP_URL + '/cc/metadata/' + ci._id;

            var html = text;

            //logger.debug(user,'sending');

            // TODO - handle email error
            mailer.sendNotificationMail(user.userName, text, html, function (error, info) {

                if (error) {
                    logger.error(error, 'error');
                }
                else {
                    logger.debug(info, 'Message sent');
                }
            });
        }
    }

    function sendActiveChangedNotificationEmail(user, ci) {

        if (sendEmailNotifications) {

            var text = '';
            text += 'The following Copy Instruction had it\'s active status changed to <b>' + ci.active;
            text += "<br/>";
            text += "<br/>";
            text += 'Network: ' + (ci.network ? ci.network : '---');
            text += "<br/>";
            text += 'Advertiser: ' + (ci.advertiser ? ci.advertiser : '---');
            text += "<br/>";
            text += 'Brand: ' + (ci.brand ? ci.brand : '---');
            text += "<br/>";
            text += 'Air Dates: ' + moment(ci.air_date_start).format('MM/DD/YYYY') + ' - ' + moment(ci.air_date_end).format('MM/DD/YYYY');
            text += "<br/>";
            text += "<br/>";
            text += config.APP_URL + '/cc/metadata/' + ci._id;

            var html = text;

            //logger.debug(user,'sending');

            // TODO - handle email error
            mailer.sendNotificationMail(user.userName, text, html, function (error, info) {

                if (error) {
                    logger.error(error, 'error');
                }
                else {
                    logger.debug(info, 'Message sent');
                }
            });
        }
    }

    function sendOwnerChangedNotificationEmail(user, ci) {

        if (sendEmailNotifications) {

            var text = '';
            text += 'The following Copy Instruction had it\'s owner changed to <b>' + ci.owner + '</b>';
            text += "<br/>";
            text += "<br/>";
            text += 'Network: ' + (ci.network ? ci.network : '---');
            text += "<br/>";
            text += 'Advertiser: ' + (ci.advertiser ? ci.advertiser : '---');
            text += "<br/>";
            text += 'Brand: ' + (ci.brand ? ci.brand : '---');
            text += "<br/>";
            text += 'Air Dates: ' + moment(ci.air_date_start).format('MM/DD/YYYY') + ' - ' + moment(ci.air_date_end).format('MM/DD/YYYY');
            text += "<br/>";
            text += "<br/>";
            text += config.APP_URL + '/cc/metadata/' + ci._id;

            var html = text;

            //logger.debug(user,'sending');

            // TODO - handle email error
            mailer.sendNotificationMail(user.userName, text, html, function (error, info) {

                if (error) {
                    logger.error(error, 'error');
                }
                else {
                    logger.debug(info, 'Message sent');
                }
            });
        }
    }

    /*function findPossibleRevisions(ci) {

     var query = {
     advertiser: ci.advertiser
     };

     return Advertiser
     .findOneAsync(query)
     .then(function (advertiser) {

     var query2 = {
     //_id: {$ne: ci._id}, //We need to get the original version based on 'possible_revision' flag and show it on the right side in UI.
     network: ci.network,
     advertiser: ci.advertiser,
     type: ci.type,
     air_date_start: {$lte: ci.air_date_end},
     air_date_end: {$gte: ci.air_date_start},
     stapled_to: {$exists: false}
     };

     if (advertiser.files_by_brand) {
     query2.brand = ci.brand;
     }
     if (advertiser.files_by_program) {
     query2.program = ci.program;
     }

     return CI
     .find(query2)
     .sort({'updated_at': -1})
     .execAsync();
     })
     }*/

    function findUninstructedMatches(mediaCompany, criteria) {

        var query = {
            media_company_id: mediaCompany._id,
            advertiser: criteria.advertiser
        };

        //logger.debug(query,'query');

        return Advertiser
            .findOneAsync(query)
            .then(function (advertiser) {

                logger.debug(advertiser, 'advertiser');

                var query2 = {
                    network: criteria.network,
                    advertiser: criteria.advertiser,
                    type: criteria.type,
                    air_date_start: {$lte: criteria.airDate},
                    air_date_end: {$gte: criteria.airDate},
                    stapled_to: {$exists: false}
                };

                if (advertiser.files_by_brand) {
                    query2.brand = criteria.brand;
                }
                if (advertiser.files_by_program) {
                    query2.program = criteria.program;
                }

                logger.debug(query2, 'query2');

                return CI
                    //.findCustom({user: req.user, query:query2})
                    .find({query: query2})
                    .execAsync();
            })
    }

    function clearUninstructedMatchesFromNetworks(networkNames) {

        var query = {
            network: {$in: networkNames},
            uninstructed_match: true
        };

        logger.debug(query, 'query');

        return CI
            //.findCustomAsync({user: req.user,query:query})
            .findAsync({query: query})
            .then(function (cis) {

                logger.debug(cis, 'cis');

                var promises = [];

                R.forEach(function (ci) {

                    //ci.__docVersion = null;
                    ci.uninstructed_match = false;

                    promises.push(CI
                        .findOneAsync({
                            _id: ci._id
                        })
                        .then(function (_ci) {

                            logger.debug(_ci, '_ci');

                            _ci.merge(ci);

                            logger.debug(_ci, '_ci');

                            return _ci
                                .saveAsync();
                        }));
                },cis);

                logger.debug(promises, 'promises');

                return Promise.all(promises);
            });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //<editor-fold description="New Possible Revisions Logic">
    /**
     * returns the possibly revised candidate CIs that have matching metadata
     *
     * @param req
     * @param res
     */
    function possiblyRevisedCandidates(req, res) {

        var query = {_id: req.params.id};

        CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (ci) {
                //find the possibel revisions for this CI
                return _find_possible_revisions(ci, req.user.userName, req);
            })
            .then(function (cis) {

                res.send(cis);
            })
            .catch(function (error) {

                return res.status(500).send({error: error.toString()});
            });
    }

    /**
     * returns the CIs that are matching with the metadata of passed CI
     *
     * @param ci
     * @param userName
     * @returns {*}
     * @private
     */
    function _find_possible_revisions(ci, userName, req) {

        var query = {advertiser: ci.advertiser};

        return Advertiser
            .findOneAsync(query)
            .then(function (advertiser) {

                var query2 = {
                    _id: {$ne: ci._id}, //skip the one we are comparing!
                    network: ci.network,
                    advertiser: ci.advertiser,
                    type: ci.type,
                    air_date_start: {$lte: ci.air_date_end},
                    air_date_end: {$gte: ci.air_date_start},
                    stapled_to: {$exists: false},
                    $or: [{status: _CI.STATUS.IN_PROGRESS}, {status: _CI.STATUS.COMPLETED}]
                    //owner: userName //same owner as the logged in user
                };

                if (advertiser.files_by_brand) {
                    query2.brand = ci.brand;
                }
                if (advertiser.files_by_program) {
                    query2.program = ci.program;
                }

                return CI
                    .findCustom({user: req.user, query: query2})
                    .execAsync();
            })
            .catch(function (error) {
                logger.error(error, "Error while finding possible revisions for CI " + ci._id);
                return res.status(500).send({
                    status: 'Error while finding possible revisions',
                    error: error.toString()
                });
            });
    }

    /**
     * this is to get the CI count that matches the metadata on the passed CI
     * for which the possible revision decision is still pending. Based on this
     * count we will restrict the User from filing a new CI.
     * @param ci
     */
    function getPossibleRevisions_PendingDecision(req, res) {

        var ciId = req.params.id;
        var ci = req.body;

        return _find_possible_revisions(ci, req.user.userName, req)
            .then(function (cis) {

                var filterCIs = _.filter(cis, function (_ci) {
                    return _ci.possibly_revised === true || _ci.possible_revision === true;
                });

                logger.debug("getPossibleRevisions_PendingDecision for " + ci._id);
                return res.send(filterCIs);
            })
            .catch(function (error) {
                logger.error(error, "Error while getting getPossibleRevisions_PendingDecision for " + ci._id);
                return res.status(500).send({
                    status: 'Error while getting possible revisions with pending decisions',
                    error: error.toString()
                });
            });
    }

    /**
     * this is to toggle the below flag on a CI.
     *
     * POSSIBLE_REVISION
     * POSSIBLY_REVISED
     * PENDING_REVISION
     * STUCK
     *
     * @param ciId
     * @param flagType
     * @param bFlag
     * @returns {*}
     * @private
     */
    function _set_CI_flag(ciId, flagType, bFlag, req) {

        var query = {_id: ciId};

        logger.debug("Setting " + flagType + " flag to " + bFlag + " for CI " + ciId);

        return CI
            .findOneCustomAsync({user: req.user, query: query})
            .then(function (ci) {

                switch (flagType) {
                    case 'POSSIBLE_REVISION':
                        ci.possible_revision = bFlag;
                        break;
                    case 'POSSIBLY_REVISED':
                        ci.possibly_revised = bFlag;
                        break;
                    case 'PENDING_REVISION':
                        ci.pending_revision = bFlag;
                        break;
                    case 'STUCK':
                        ci.stuck = bFlag;
                        break;
                    case 'NOT_REVIEWED':
                        ci.notReviewed = bFlag;
                        break;
                    case 'MARKED_AS_APPLIED':
                        ci.markedAsApplied = bFlag;
                        break;
                    case 'UNINSTRUCTED_MATCH':
                        ci.uninstructed_match = bFlag;
                        break;
                }

                //update the updatedUser & updated_by_id
                ci.updatedUser = req.user.userName;
                ci.updated_by_id = req.user._id;

                return ci
                    .saveAsync();
            })
            .then(function (ci) {
                var _ci = _.isArray(ci) ? ci[0] : ci;
                logger.debug(flagType + " flag has been set to " + bFlag + " for CI " + ciId);
                return _ci;
            })
            .catch(function (error) {
                logger.error(error, "Error while setting " + flagType + " flag to " + bFlag + " for CI " + ciId);
                return {error: error.toString()};
            });
    }
    
/*    function _saveCIHistory (err, _savedCIDoc) {
    	if(_savedCIDoc){
    		CI.saveHistory(_savedCIDoc, "updated");
    	}                                	
    }*/

    /**
     * this is used to Staple the pending revision & Possibly revised candidate(s)
     * together as a bundle.
     *
     * @param req
     * @param res
     */
    function stapleRevisions(req, res) {

        var ci_id = req.params.id;
        var stapleDecisions = req.body;

        //YES Staple Candidates
        var all_staple_ids = [];
        var all_staples = [];
        //this is to add 'stapled_to' for a bundle
        var all_staple_bundle_ids = [];

        //NO Staple Candidates
        var no_staples = [];
        var no_staple_ids = [];

        var new_stapled_ci;

        no_staple_ids.push(ci_id);

        //decisions made for staple (revision, attachment, and duplicate), not stapling.
        _.forEach(stapleDecisions, function (decision) {
            if (decision.revisionOption.staple === 'YES') {

                //isCandidateBundle
                //candidateBundleIds

                if (decision.isCandidateBundle) {
                    all_staple_bundle_ids.push(decision.candidateCIId);

                    //candidate is already a stapled CI, candidate versions are versions of the new bundle also!
                    _.forEach(decision.candidateBundleIds, function (bundleId) {
                        all_staple_ids.push(bundleId);
                        all_staples.push({
                            candidateCIId: bundleId,
                            candidateRevisionFlag: decision.candidateRevisionFlag,
                            revisionCIId: decision.revisionCIId,
                            option: decision.revisionOption.option
                        });
                    });
                } else {
                    all_staple_ids.push(decision.candidateCIId);
                    all_staples.push({
                        candidateCIId: decision.candidateCIId,
                        candidateRevisionFlag: decision.candidateRevisionFlag,
                        revisionCIId: decision.revisionCIId,
                        option: decision.revisionOption.option
                    });
                }

            } else {
                no_staple_ids.push(decision.candidateCIId);
                no_staples.push({
                    candidateCIId: decision.candidateCIId,
                    revisionCIId: decision.revisionCIId,
                    reason: decision.revisionOption.reason
                })
            }
        });

        //1. YES Stapling
        if (all_staple_ids.length > 0) {
            //include the possible revision CI Id also, for correct metadata on the new bundled CI
            all_staple_ids.push(ci_id);

            logger.debug(all_staple_ids, 'staple::all_staple_ids');
            var query = {_id: {$in: all_staple_ids}};

            CI
                .findCustom({user: req.user, query: query})
                .sort({'updated_at': -1}) //this is for the new staple to pick up the brand/program of the latest possible revision.
                .execAsync()
                .bind({})
                .then(function (cis_to_staple) {
                    //Take one of the CI for metadata
                    this.ci = cis_to_staple[0];

                    /**
                     * min Start Date
                     * max End Date
                     * any uninstructed match flag
                     * any Stuck flag
                     */
                    var air_date_start = moment.min(_.map(cis_to_staple, function (ci) {
                        return new moment(ci.air_date_start);
                    }));
                    var air_date_end = moment.max(_.map(cis_to_staple, function (ci) {
                        return new moment(ci.air_date_end);
                    }));
                    var uninstructed_match = _.any(cis_to_staple, function (ci) {
                        return ci.uninstructed_match
                    });
                    var stuck = _.any(cis_to_staple, function (ci) {
                        return ci.stuck
                    });
                    var notReviewed = _.any(cis_to_staple, function (ci) {
                        return ci.notReviewed
                    });
                    var markedAsApplied = _.any(cis_to_staple, function (ci) {
                        return ci.markedAsApplied
                    });
                    //staple array with all these CI Ids
                    var cis = _.map(all_staple_ids, function (ci_id) {
                        return {
                            ci_id: ci_id,
                            created_at: new moment()
                        };
                    });

                    /**
                     * Logic to determine if the new staple will have
                     * 'pending_revision' flag set to TRUE
                     **/
                    var _bPendingRevisionFlag = false;
                    //Update DUPLICATE in Notes field.
                    _.forEach(all_staples, function (staple) {

                        //new staple will have 'pending_revision' TRUE if atleast one of the candidates are
                        //stapled as a revision or attachement
                        if (staple.option === 'REVISION' || staple.option === 'ATTACHMENT' || staple.candidateRevisionFlag === true) {
                            _bPendingRevisionFlag = true;
                            return;
                        }
                    });

                    //this is the metadata of the new bundle
                    var new_staple_ci = {
                        network: this.ci.network,
                        advertiser: this.ci.advertiser,
                        advertiser_id: this.ci.advertiser_id,
                        brand: this.ci.brand,
                        brand_id: this.ci.brand_id,
                        program: this.ci.program,
                        type: this.ci.type,
                        type_id: this.ci.type_id,
                        //ingest: this.ci.get('ingest'), //we should get ingest from the versions!
                        //owner: this.ci.owner, //Pivotal# 97054046
                        owner: req.user.userName,
                        owner_id: req.user._id,
                        air_date_start: air_date_start,
                        air_date_end: air_date_end,
                        status: _CI.STATUS.IN_PROGRESS, //this is the status of new stapled CI
                        pending_revision: _bPendingRevisionFlag, //this is the new bundle status
                        possibly_revised: false,
                        possible_revision: false,
                        uninstructed_match: uninstructed_match,
                        stuck: stuck,
                        notReviewed: notReviewed,
                        markedAsApplied: markedAsApplied,
                        staple: cis
                    };

                    logger.debug(new_staple_ci, 'staple::new_staple_ci create');

                    return CI
                        .createAsync(new_staple_ci);

                })
                .then(function (staple_ci) {
                    //this is the new stapled CI with staple array [Ids of all cis compared] inside it
                    new_stapled_ci = staple_ci;

                    logger.debug(new_stapled_ci._id, 'staple::new_stapled_ci created');

                    /**
                     * update all the original CIs (both non bundles, bundles) with these conditions
                     *
                     * possibly_revised: false
                     * possible_revision: false
                     * stapled_to: new staple ci id
                     *
                     */

                    var promises = [];

                    //merge both non bundles & bundles
                    var _all_Ids = _.union(all_staple_ids, all_staple_bundle_ids);
                    _.forEach(_all_Ids, function (ci_id) {

                        promises.push(CI
                                .findOneAndUpdate({_id: ci_id},
                                {
                                    possibly_revised: false, //this was true for the candidate(s)
                                    possible_revision: false, //this was true for the possible revision
                                    stapled_to: staple_ci._id //this is the newly created bundle's id
                                })
                        );

                    });
                    logger.debug(promises, 'promises for all_staple_ids');

                    return Promise.all(promises);
                })
                .then(function (updated_cis_count) {
                    //Conditions on all the original CIs are updated
                    logger.debug(updated_cis_count, 'ci::updated_cis_count');

                    var noteUpdates = [];
                    //Update DUPLICATE in Notes field.
                    _.forEach(all_staples, function (staple) {

                        if (staple.option === 'REVISION' || staple.option === 'ATTACHMENT') {
                            return;
                        }
                        var query = {
                            _id: staple.revisionCIId
                        };
                        var option = _CI.STAPLE_NOTES[staple.option];

                        noteUpdates.push(CI.findOneAndUpdate(query, {note: option}, function (err, numAffected) {
                            if (err) {
                                logger.error(err, 'Error while updating notes on stapled version: ' + staple.ciId);
                            }
                            logger.debug(numAffected, 'Notes updated on stapled version with ' + staple.option);
                        }));

                    });

                    return Promise.all(noteUpdates).then(function () {
                        logger.debug("all notes are updated!");
                        //res.send(new_stapled_ci);
                    });

                })
                .then(function () {
                    //remove from parking lot if the possible revisions are already added there!
                    logger.debug('Removing the old CIs from parking lot...');

                    //merge both non bundles & bundles
                    var _all_Ids = _.union(all_staple_ids, all_staple_bundle_ids);
                    _remove_from_parkinglot(req.user._id, _all_Ids)
                        .then(function (parkinglot) {
                            logger.debug(parkinglot, 'Removed the old CIs from parking lot.');

                            //done with all logic, return the newly created bundle here.
                            res.send(new_stapled_ci);
                        })
                        .catch(function (error) {
                            logger.error(error, 'Error while removing the old CIs from parking lot.');

                            return res.send({
                                status: 'ERROR',
                                error: error.toString()
                            });
                        });

                })
                .catch(function (error) {

                    logger.error(error, 'error');
                    return res.status(500).send({
                        status: 'Error while updating staple CI bundle',
                        error: error.toString()
                    });
                });
        }

        //2. No Stapling
        /**
         * possible_revision = false;
         * reason_for_not_staple = decision's reason;
         */
        if (no_staples.length > 0) {
            logger.debug(no_staples, 'no staple:: no_staples');

            var noUpdates = [];
            //update the REASON for not stapling...
            _.forEach(no_staples, function (no_staple) {

                var query = {
                    _id: no_staple.candidateCIId //revisionCIId
                };
                var conditions = {
                    possibly_revised: false, //this was true for the candidate
                    possible_revision: false, //this was true for the possible revision
                    reason_for_not_staple: no_staple.reason,
                    updated_at: new moment(), //this is to make sure it appears in library in 1st page!
                    updatedUser: req.user.userName,
                    updated_by_id: req.user._id
                };

                noUpdates.push(CI.findOneAndUpdateCustom({
                    user: req.user,
                    query: query,
                    update: conditions
                }, function (err, numAffected) {
                    if (err) {
                        logger.error(err, 'Error while updating reason on non stapled version: ' + no_staple.ciId);
                    }
                    logger.debug(numAffected, '::Reason updated on non stapled version with ' + no_staple.reason);
                }));
            });

            //this is to update the possible_revision if there are no staples. fallback!
            noUpdates.push(CI.findOneAndUpdateCustom(
                {
                    user: req.user, query: {_id: ci_id}, update: {
                    possibly_revised: false,
                    possible_revision: false,
                    updated_at: new moment(), //this is to make sure it appears in library in 1st page!
                    updatedUser: req.user.userName,
                    updated_by_id: req.user._id
                }
                }, function (err, numAffected) {
                    if (err) {
                        logger.error(err, 'Error while updating the revision flags on non stapled version: ' + ci_id);
                    }
                    logger.debug(numAffected, '::Flags updated on non stapled version: ' + ci_id);
                }));

            Promise.all(noUpdates).then(function () {
                logger.debug("all reasons are updated for non stapled versions!");
                res.send(new_stapled_ci);
            });
        }
    }

    /**
     * this is used to remvoe all the candidates from parking lot once a staple/bundle is
     * created from the possible revision, possibly revised candiate(s).
     *
     * @param userId
     * @param all_staple_ids
     * @private
     */
    function _remove_from_parkinglot(userId, all_staple_ids) {

        var query = {user_id: userId};

        return ParkingLot
            .findOneAsync(query)
            .then(function (parkinglot) {

                if (parkinglot) {
                	
                	var cisCountBeforeStple = parkinglot.cis.length;
                	
                    parkinglot.cis = _.filter(parkinglot.cis, function (ci_id) {
                        return _.indexOf(all_staple_ids, ci_id.toString()) === -1;
                    });                    

                    if(parkinglot.cis.length !== cisCountBeforeStple){
                        parkinglot.markModified('cis');
                        return parkinglot
                            .saveAsync();
                    }else{
                    	return new Promise(function(resolve, reject) {
                    		return resolve(parkinglot);
                    	});
                    }

                }
                else {
                    return 'NO_PARKINGLOT_FOR_USER';
                }
            })
            .then(function (parkinglot) {

                logger.debug(parkinglot, 'Removed the old CIs from parking lot.');

                return parkinglot;
            })
            .catch(function (error) {

                logger.error(error, 'Error while removing the old CIs from parking lot.');

                return error;
            });
    }

    /**
     * clears the pending revision flag on a CI.
     *
     * @param req
     * @param res
     * @returns {*}
     */
    function clearPendingRevision(req, res) {

        var ciId = req.params.id;

        return _set_CI_flag(ciId, 'PENDING_REVISION', false, req)
            .then(function (ci) {

                logger.debug("PENDING_REVISION flag has been cleared for CI " + ci._id);
                res.send(ci);
            })
            .catch(function (error) {
                logger.error(error, 'ERROR: while clearing the PENDING_REVISION flag for CI ' + ciId);
                return res.status(500).send({error: error.toString});
            });
    }

    /**
     * clears the uninstructed match flag on a CI.
     *
     * @param req
     * @param res
     * @returns {*}
     */
    function clearUninstructedMatch(req, res) {

        var ciId = req.params.id;

        return _set_CI_flag(ciId, 'UNINSTRUCTED_MATCH', false, req)
            .then(function (ci) {

                logger.debug("UNINSTRUCTED_MATCH flag has been cleared for CI " + ci._id);
                res.send(ci);
            })
            .catch(function (error) {
                logger.error(error, 'ERROR: while clearing the UNINSTRUCTED_MATCH flag for CI ' + ciId);
                return res.status(500).send({error: error.toString});
            });
    }

    /**
     * clears the Stuck flag on a CI.
     *
     * @param req
     * @param res
     * @returns {Promise}
     */
    function clearStuckFlag(req, res) {

        var _all_Ids = [];
        var ciId = req.params.id;
        var revisionId = req.body.revisionId;

        _all_Ids.push(ciId);
        // Don't perform duplicate operation if revisionid === ciid
        if (revisionId && revisionId !== ciId) {
            _all_Ids.push(revisionId);
        }

        var promises = [];

        _.forEach(_all_Ids, function (ci_id) {

            promises.push(
                _set_CI_flag(ci_id, 'STUCK', false, req)
                    .then(function (cis) {

                        logger.debug("STUCK flag has been cleared for CI " + ci_id);
                        res.send(cis);
                    })
                    .catch(function (error) {
                        logger.error(error, 'ERROR: while clearing the STUCK flag for CI ' + ciId);
                        return res.status(500).send({error: error.toString});
                    }));
        });
        logger.debug(promises, 'promises for all_staple_ids');

        return Promise.all(promises);
    }

    /**
     * set the Stuck falg to TRUE on a CI.
     *
     * @param req
     * @param res
     * @returns {Promise}
     */
    function setStuckFlag(req, res) {

        var _all_Ids = [];
        var ciId = req.params.id;
        var revisionId = req.body.revisionId;

        _all_Ids.push(ciId);
        // Don't perform duplicate operation if revisionid === ciid
        if (revisionId && revisionId !== ciId) {
            _all_Ids.push(revisionId);
        }

        var promises = [];

        _.forEach(_all_Ids, function (ci_id) {

            promises.push(
                _set_CI_flag(ci_id, 'STUCK', true, req)
                    .then(function (cis) {

                        logger.debug("STUCK flag has been set for CI " + ci_id);
                        res.send(cis);
                    })
                    .catch(function (error) {
                        logger.error(error, 'ERROR: while setting the STUCK flag for CI ' + ciId);
                        return res.status(500).send({error: error.toString});
                    })
            );

        });
        logger.debug(promises, 'promises for all_staple_ids');

        return Promise.all(promises);
    }

    /**
     * clears the MARKED_AS_APPLIED flag on a CI.
     *
     * @param req
     * @param res
     * @returns {Promise}
     */
    function clearMarkedAsAppliedFlag(req, res) {

        var _all_Ids = [];
        var ciId = req.params.id;
        var revisionId = req.body.revisionId;

        _all_Ids.push(ciId);
        // Don't perform duplicate operation if revisionid === ciid
        if (revisionId && revisionId !== ciId) {
            _all_Ids.push(revisionId);
        }

        var promises = [];

        _.forEach(_all_Ids, function (ci_id) {

            promises.push(
                _set_CI_flag(ci_id, 'MARKED_AS_APPLIED', false, req)
                    .then(function (cis) {

                        logger.debug("MarkedAsApplied flag has been cleared for CI " + ci_id);
                        res.send(cis);
                    })
                    .catch(function (error) {
                        logger.error(error, 'ERROR: while clearing the MarkedAsApplied flag for CI ' + ciId);
                        return res.status(500).send({error: error.toString});
                    })
            );

        });
        logger.debug(promises, 'promises for all_staple_ids');

        return Promise.all(promises);
    }

    /**
     * set the MARKED_AS_APPLIED falg to TRUE on a CI.
     *
     * @param req
     * @param res
     * @returns {Promise}
     */
    function setMarkedAsAppliedFlag(req, res) {

        var _all_Ids = [];
        var ciId = req.params.id;
        var revisionId = req.body.revisionId;

        _all_Ids.push(ciId);
        // Don't perform duplicate operation if revisionid === ciid
        if (revisionId && revisionId !== ciId) {
            _all_Ids.push(revisionId);
        }

        var promises = [];

        _.forEach(_all_Ids, function (ci_id) {

            promises.push(
                _set_CI_flag(ci_id, 'MARKED_AS_APPLIED', true, req)
                    .then(function (cis) {

                        logger.debug("MarkedAsApplied flag has been set for CI " + ci_id);
                        res.send(cis);
                    })
                    .catch(function (error) {
                        logger.error(error, 'ERROR: while setting the MarkedAsApplied flag for CI ' + ciId);
                        return res.status(500).send({error: error.toString});
                    })
            );

        });
        logger.debug(promises, 'promises for all_staple_ids');

        return Promise.all(promises);
    }

    /**
     * clears the NOT_REVIEWED flag on a CI.
     *
     * @param req
     * @param res
     * @returns {Promise}
     */
    function clearNotReviewedFlag(req, res) {

        var _all_Ids = [];
        var ciId = req.params.id;
        var revisionId = req.body.revisionId;

        _all_Ids.push(ciId);
        // Don't perform duplicate operation if revisionid === ciid
        if (revisionId && revisionId !== ciId) {
            _all_Ids.push(revisionId);
        }

        var promises = [];

        _.forEach(_all_Ids, function (ci_id) {

            promises.push(
                _set_CI_flag(ci_id, 'NOT_REVIEWED', false, req)
                    .then(function (cis) {

                        logger.debug("NOT_REVIEWED flag has been cleared for CI " + ci_id);
                        res.send(cis);
                    })
                    .catch(function (error) {
                        logger.error(error, 'ERROR: while clearing the NOT_REVIEWED flag for CI ' + ciId);
                        return res.status(500).send({error: error.toString});
                    })
            );

        });
        logger.debug(promises, 'promises for all_staple_ids');

        return Promise.all(promises);
    }

    /**
     * set the NOT_REVIEWED falg to TRUE on a CI.
     *
     * @param req
     * @param res
     * @returns {Promise}
     */
    function setNotReviewedFlag(req, res) {

        var _all_Ids = [];
        var ciId = req.params.id;
        var revisionId = req.body.revisionId;

        _all_Ids.push(ciId);
        // Don't perform duplicate operation if revisionid === ciid
        if (revisionId && revisionId !== ciId) {
            _all_Ids.push(revisionId);
        }

        var promises = [];

        _.forEach(_all_Ids, function (ci_id) {

            promises.push(
                _set_CI_flag(ci_id, 'NOT_REVIEWED', true, req)
                    .then(function (cis) {

                        logger.debug("NOT_REVIEWED flag has been set for CI " + ci_id);
                        res.send(cis);
                    })
                    .catch(function (error) {
                        logger.error(error, 'ERROR: while setting the NOT_REVIEWED flag for CI ' + ciId);
                        return res.status(500).send({error: error.toString});
                    })
            );

        });
        logger.debug(promises, 'promises for all_staple_ids');

        return Promise.all(promises);
    }

    /**
     * this is to unstaple the CI that is selected in UI, from a bundle of CIs.
     *
     * @param req
     * @param res
     * @returns {*}
     */
    function unstapleVersion(req, res) {

        var ciId = req.params.id; //source
        var sourceStatus = req.body.sourceStatus; //source CI revision status
        var versionId = req.body.targetId; //target
        var reason = req.body.reason; //reason to unstaple

        logger.debug('Source: ' + ciId + ', Target: ' + versionId + ', Reason: ' + reason, 'Unstaple Version :: ');

        //get the source CI
        var query = {_id: ciId};
        return CI
            .findOneAsync(query)
            .then(function (sourceCI) {
                if (sourceCI) {
                    //check if target is in the staples
                    var targetIndex = -1;

                    if (_.isArray(sourceCI.staple) && sourceCI.staple.length > 0) {
                        targetIndex = _.findIndex(sourceCI.staple, function (_staple) {
                            return _staple.ci_id === versionId;
                        });
                    }

                    logger.debug(targetIndex, 'Unstaple Version :: targetIndex');
                    if (targetIndex > -1) {
                        //unstaple target from source
                        /**
                         * 1. AB - seperate A, B
                         * 2. ABC - unstaple one of A/B/C from the bundle, create a new bundle with the remaining
                         */

                        if (sourceCI.staple.length == 2) {
                            //1. AB - seperate A, B
                            var _sourceId = ciId;
                            var _firstId = versionId;
                            var _secondId = _.pluck(_.reject(sourceCI.staple, {'ci_id': versionId}), 'ci_id')[0];

                            return _unstaple_version_split(_sourceId, _firstId, _secondId, reason, req.user)
                                .then(function (unstaples) {
                                    //array of 3 CIs returned, return 3rd one
                                	var _ci = unstaples[2].toObject();

                                    //remove from parkinglot, if any of the old ones are in there!
                                    var _all_Ids = [_sourceId, _firstId, _secondId];
                                    _remove_from_parkinglot(req.user._id, _all_Ids)
                                        .then(function (parkinglot) {
                                            logger.debug(parkinglot, 'Removed the old CIs from parking lot.');

                                            //done with all logic, return the newly created CI here.
                                            res.send({
                                                newCI: _ci
                                            });
                                            //res.send(new_stapled_ci);
                                        })
                                        .catch(function (error) {
                                            logger.error(error, 'Error while removing the old CIs from parking lot.');

                                            return res.send({
                                                status: 'ERROR',
                                                error: error.toString()
                                            });
                                        });
                                })
                                .catch(function (error) {
                                    logger.error(error, 'ERROR: while unstapling the CIs');
                                    return res.status(500).send({reason: error.toString()});
                                });

                        } else {
                            //2. ABC - unstaple one of A/B/C from the bundle, create a new bundle with the remaining.
                            return _unstaple_version_restaple(sourceCI, versionId, reason, req.user)
                                .then(function (unstaples) {
                                    //array of 3 CIs returned, return 3rd one

                                    var _ci = unstaples[2].toObject();


                                    //remove from parkinglot, if any of the old ones are in there!
                                    var _all_Ids = [ciId, versionId];
                                    _remove_from_parkinglot(req.user._id, _all_Ids)
                                        .then(function (parkinglot) {
                                            logger.debug(parkinglot, 'Removed the old CIs from parking lot.');

                                            //done with all logic, return the newly created CI here.
                                            res.send({
                                                newCI: _ci
                                            });
                                            //res.send(new_stapled_ci);
                                        })
                                        .catch(function (error) {
                                            logger.error(error, 'Error while removing the old CIs from parking lot.');

                                            return res.send({
                                                status: 'ERROR',
                                                error: error.toString()
                                            });
                                        });
                                })
                                .catch(function (error) {
                                    logger.error(error, 'ERROR: while unstapling the CIs ');
                                    return res.status(500).send({reason: error.toString()});
                                });
                        }
                    } else {
                        var _error = new Error("Selected version is not part of this Staple in DB.");
                        logger.error(_error, "ERROR: Unstaple Version :: Version is not part of this Staple in DB :: " + versionId);
                        return res.status(500).send({reason: _error.toString()});
                    }


                } else {
                    var error = new Error("Staple CI bundle doesn't exist in DB.");
                    logger.error(error, "ERROR: Unstaple Version :: Staple CI doesn't exist in DB :: " + ciId);
                    return res.status(500).send({reason: error.toString()});
                }
            })
            .catch(function (error) {
                logger.error(error, 'ERROR: in unstaple version logic while finding the source CI ' + ciId);
                return res.status(500).send({reason: error.toString()});
            });
    }

    /**
     * this is to unstaple the target CI and restaple the remaining CIs in the bundle.
     *
     * @param sourceCI
     * @param targetId
     * @param reason
     * @returns {*}
     * @private
     */
    function _unstaple_version_restaple(sourceCI, targetId, reason, user) {

        var sourceId = sourceCI._id;

        var all_ids = [sourceId, targetId];

        var promises = [];

        _.forEach(all_ids, function (ci_id) {
            //source & target
            switch (ci_id) {
                case sourceId:
                    promises.push(CI
                            .findOneAndUpdate({_id: ci_id},
                            {
                                status: _CI.STATUS.UNSTAPLED,
                                updated_at: new moment(), //this is to make sure it appears in library in 1st page!
                                updatedUser: user.userName,
                                updated_by_id: user._id
                            })

                    );
                    break;
                case targetId:
                    promises.push(CI
                            .findOneAndUpdate({_id: ci_id},
                            {
                                $unset: {stapled_to: ""},
                                $set: {reason_to_unstaple: reason},
                                updated_at: new moment(), //this is to make sure it appears in library in 1st page!
                                updatedUser: user.userName,
                                updated_by_id: user._id
                            })

                    );
                    break;
            }
        });

        var remainingIds = _.pluck(_.reject(sourceCI.staple, {'ci_id': targetId}), 'ci_id');
        var new_stapled_ci;

        //restaple remaining
        var query = {_id: {$in: remainingIds}};

        promises.push(
            CI
                //.findCustom({accessibleNetworks: req.session.accessibleNetworks, query: query})
                .find(query)
                .sort({'updated_at': -1}) //this is for the new staple to pick up the brand/program of the latest possible revision.
                .execAsync()
                .bind({})
                .then(function (cis_to_staple) {
                    //Take one of the CI for metadata
                    this.ci = cis_to_staple[0];

                    /**
                     * min Start Date
                     * max End Date
                     * any uninstructed match flag
                     * any Stuck flag
                     */
                    var air_date_start = moment.min(_.map(cis_to_staple, function (ci) {
                        return new moment(ci.air_date_start);
                    }));
                    var air_date_end = moment.max(_.map(cis_to_staple, function (ci) {
                        return new moment(ci.air_date_end);
                    }));
                    var uninstructed_match = _.any(cis_to_staple, function (ci) {
                        return ci.uninstructed_match
                    });
                    var stuck = _.any(cis_to_staple, function (ci) {
                        return ci.stuck
                    });
                    var notReviewed = _.any(cis_to_staple, function (ci) {
                        return ci.notReviewed
                    });
                    var markedAsApplied = _.any(cis_to_staple, function (ci) {
                        return ci.markedAsApplied
                    });
                    //staple array with all these CI Ids
                    var cis = _.map(remainingIds, function (ci_id) {
                        return {
                            ci_id: ci_id,
                            created_at: new moment()
                        };
                    });

                    //this is the metadata of the new bundle
                    var new_staple_ci = {
                        network: this.ci.network,
                        advertiser: this.ci.advertiser,
                        advertiser_id: this.ci.advertiser_id,
                        brand: this.ci.brand,
                        brand_id: this.ci.brand_id,
                        program: this.ci.program,
                        type: this.ci.type,
                        type_id: this.ci.type_id,
                        //owner: this.ci.owner, //Pivotal# 97054046
                        owner: user.userName,
                        owner_id: user._id,
                        air_date_start: air_date_start,
                        air_date_end: air_date_end,
                        status: _CI.STATUS.IN_PROGRESS, //this is the status of new stapled CI
                        pending_revision: sourceCI.pending_revision, //true, //this is the new bundle status
                        possibly_revised: false,
                        possible_revision: false,
                        uninstructed_match: uninstructed_match,
                        stuck: stuck,
                        notReviewed: notReviewed,
                        markedAsApplied: markedAsApplied,
                        staple: cis
                    };
                    logger.debug(new_staple_ci, 'staple::new_staple_ci create');

                    return CI
                        .createAsync(new_staple_ci);
                })
                .then(function (staple_ci) {
                    //this is the new stapled CI with staple array [Ids of all cis compared] inside it
                    new_stapled_ci = staple_ci;

                    logger.debug(new_stapled_ci._id, 'staple::new_stapled_ci created');

                    /**
                     * update all the original CIs (both non bundles, bundles) with these conditions
                     *
                     * possibly_revised: false
                     * possible_revision: false
                     * stapled_to: new staple ci id
                     *
                     */

                    var promises = [];

                    //merge both non bundles & bundles
                    //var _all_Ids = _.union(all_staple_ids, all_staple_bundle_ids);
                    _.forEach(remainingIds, function (ci_id) {
                        promises.push(CI
                                .findOneAndUpdate({_id: ci_id},
                                {
                                    possibly_revised: false, //this was true for the candidate(s)
                                    possible_revision: false, //this was true for the possible revision
                                    stapled_to: staple_ci._id //this is the newly created bundle's id
                                })
                        );
                    });
                    logger.debug(promises, 'promises for all_staple_ids');

                    return Promise.all(promises);
                })
                .then(function () {
                    return new_stapled_ci;
                })
        );
        logger.debug(promises, 'promises for _unstaple_version_restaple');

        return Promise.all(promises);
    }

    /**
     * this is to unstaple the target CI and split the remaining standalone CI in the bundle
     *
     * @param sourceId
     * @param firstId
     * @param secondId
     * @param reason
     * @returns {*}
     * @private
     */
    function _unstaple_version_split(sourceId, firstId, secondId, reason, user) {

        var all_ids = [sourceId, firstId, secondId];
        var promises = [];

        _.forEach(all_ids, function (ci_id) {

            //set 'status' to 'unstapled' for the original source/bundle (because we will create a new bundle with what is remaining)
            //unset first CI 'stapled_to'
            //unset second CI 'stapled_to'
            switch (ci_id) {
                case sourceId:
                    promises.push(CI
                            .findOneAndUpdate({_id: ci_id},
                            {
                                status: _CI.STATUS.UNSTAPLED,
                                updated_at: new moment(), //this is to make sure it appears in library in 1st page!
                                updatedUser: user.userName,
                                updated_by_id: user._id
                            })

                    );
                    break;
                case firstId:
                case secondId:
                    promises.push(CI
                            .findOneAndUpdate({_id: ci_id},
                            {
                                $unset: {stapled_to: ""},
                                $set: {reason_to_unstaple: reason},
                                updated_at: new moment(), //this is to make sure it appears in library in 1st page!
                                updatedUser: user.userName,
                                updated_by_id: user._id
                            })

                    );
                    break;
            }
        });
        logger.debug(promises, 'promises for _unstaple_version_split');

        return Promise.all(promises);
    }

    //</editor-fold>
    function ciPrint(req, res) {
        if (!req.body || !req.body.url || !req.body.urltype) {
            logger.debug("error -- unable to print CI ");
            return;
        }
        // get file from Amazon
        var fn = download_file_http(req.body.url, req.body.urltype, res);
    }

    function download_file_http(file_url, file_ext, res) {

        var DOWNLOAD_DIR = config.rootPath + '/public';        //  './downloads/';
        //   DOWNLOAD_DIR = "/tmp/";   // needs to be served from the application...

        var options = {
            host: url.parse(file_url).host,
            port: 80,
            path: url.parse(file_url).pathname
        };

        var file_name = url.parse(file_url).pathname.split('/').pop();

        var file = fs.createWriteStream(DOWNLOAD_DIR + "/" + file_name + file_ext);

        http.get(options, function (result) {
            result.on('data', function (data) {
                file.write(data);
            }).on('end', function () {
                file.end();
                console.log(file_name + file_ext + ' downloaded to ' + DOWNLOAD_DIR);
                res.send(file_name + file_ext);
            });
        });

    }

    ////////////////////////////////////////////////////////////////////////////////

    return {
        find: find,
        findById: findById,
        setStatus: setStatus,
        setNote: setNote,
        setActive: setActive,
        setRotation: setRotation,
        updateOwner: updateOwner,
        possibleRevisions: possibleRevisions,
        possiblyRevisedCandidates: possiblyRevisedCandidates,
        getPossibleRevisions_PendingDecision: getPossibleRevisions_PendingDecision,
        unstapleVersion: unstapleVersion,
        staple: staple, //OLD staple logic //clean up
        stapleRevisions: stapleRevisions, //NEW staple logic
        clearPendingRevision: clearPendingRevision,
        clearUninstructedMatch: clearUninstructedMatch,
        setStuckFlag: setStuckFlag,
        clearStuckFlag: clearStuckFlag,
        setNotReviewedFlag: setNotReviewedFlag,
        clearNotReviewedFlag: clearNotReviewedFlag,
        clearMarkedAsAppliedFlag: clearMarkedAsAppliedFlag,
        setMarkedAsAppliedFlag: setMarkedAsAppliedFlag,
        getStapledCIs: getStapledCIs,
        findNew: findNew,
        findNow: findNow,
        findByIdAndUser: findByIdAndUser,
        findStapled: findStapled,
        findRevision: findRevision,
        findStuck: findStuck,
        findUninstructed: findUninstructed,
        findLibrary: findLibrary,
        findCompleted: findCompleted,
        findArchived: findArchived,
        findEmails: findEmails,
        counted: counted,
        countsForOwners: countsForOwners,
        queueForOwners: queueForOwners,
        update: update,
        search: search,
        searchIgnoredCIs: searchIgnoredCIs,
        saveSearch: saveSearch,
        deleteSearch: deleteSearch,
        getSavedSearches: getSavedSearches,
        getSavedSearchById: getSavedSearchById,
        history: history,
        getParkingLot: getParkingLot,
        getParkingLotCIs: getParkingLotCIs,
        addToParkingLot: addToParkingLot,
        removeFromParkingLot: removeFromParkingLot,
        // FYI, below this comment, function is not exposed as a route
        //findPossibleRevisions: findPossibleRevisions, //clean up
        findUninstructedMatches: findUninstructedMatches,
        clearUninstructedMatchesFromNetworks: clearUninstructedMatchesFromNetworks,
        ciPrint: ciPrint,
        fetchPdf: fetchPdf
    };
}
