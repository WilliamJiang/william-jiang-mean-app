function DataService(mvIdentity,
                     Restangular,
                     APP_CONFIG) {

    ////////////////////////////////////////

    function nameFromKey(key) {

        var words = key.split('_');

        return _.map(words, function (word) {
            return _.capitalize(word.toLowerCase());
        }).join(' ');
    }

    ////////////////////////////////////////

    var Users = {

        setActiveNetwork: function (network_name) {

            return Restangular
                .one('users')
                .customPUT({value: network_name}, 'active_network');
        }
    };

    var Annotations = {

        getAllAnnotations: function (options) {
            var ciID = options.ciID, skip = options.skip;
            var url = 'annotation/ci/' + ciID;
            if (!skip) {
                skip = 0;
            }
            url += '/?skip=' + skip;
            if (options.hasOwnProperty("limit")) {
                url += '&limit=' + options.limit
            }
            if (options.stuck) {
                url += '&stuck=' + options.stuck
            }
            if (options.needsReview) {
                url += '&needsReview=' + options.needsReview
            }
            if (options.notes) {
                url += '&notes=' + options.notes
            }
            if (options.markedAsApplied) {
                url += '&markedAsApplied=' + options.markedAsApplied
            }
            if (options.clearstuck) {
                url += '&clearstuck=' + options.clearstuck
            }

            return Restangular
                .one(url)
                .get();
        },

        getAnnotations: function (ci_id, pageNum) {
            return Restangular
                .all('annotation/ci/' + ci_id + '/page/' + pageNum)
                .getList();
        },
        createAnnotation: function (ci_id, pageNum, annotation) {
            return Restangular
                .all("annotation")
                .one("ci", ci_id)
                .one("page", pageNum)
                .all("create")
                .post(annotation);
        },
        removeAnnotation: function (anId, annotation) {
            return Restangular
                .one('annotation', anId)
                .customDELETE();
        },
        updateAnnotation: function (anId, annotation) {
            return Restangular
                .one('annotation', anId)
                .customPUT(annotation);
        },
        getAnnotationsCountByCategory: function (ci_id, category, params) {
            var url = 'annotations/count/' + ci_id + '/' + category;
            if (params && params.hasOwnProperty("reviewed")) {
                url += '?reviewed=' + params.reviewed;
            }
            return Restangular
                .one(url)
                .get();
        }
    };

    var CI = {
        getCounts: function () {

            return Restangular
                .one('ci/counted')
                .get();
        },
        getCountsForOwners: function (owners) {
            return Restangular
                .one('ci/counts')
                .customPOST(owners);
        },
        getRevisions: function () {

            return this.getQueue('revision');
        },
        getStapledCIs: function (ci_id) {

            return Restangular
                .all('ci/' + ci_id + '/stapled_cis')
                .getList();
        },
        stapleRevisions: function (ci_id, decisions) {
            return Restangular
                .all('ci/' + ci_id + '/staple_revisions')
                .customPOST(decisions);
        },
        getPossiblyRevisedCandidates: function (ci_id) {
            return Restangular
                .all('ci/' + ci_id + '/possibly_revised')
                .getList();
        },
        clearPendingRevisionFlag: function (ci_id) {
            return Restangular
                .one('ci', ci_id)
                .customPUT({}, 'clear_pending_revision');
        },
        clearUninstructedMatchFlag: function (ci_id) {
            return Restangular
                .one('ci', ci_id)
                .customPUT({}, 'clear_uninstructed_match');
        },
        setStuckFlag: function (ci_id, revision_id) {
            return Restangular
                .one('ci', ci_id)
                .customPUT({revisionId: revision_id}, 'set_stuck');
        },
        clearStuckFlag: function (ci_id, revision_id) {
            return Restangular
                .one('ci', ci_id)
                .customPUT({revisionId: revision_id}, 'clear_stuck');
        },
        setNotReviewedFlag: function (ci_id, revision_id) {
            return Restangular
                .one('ci', ci_id)
                .customPUT({revisionId: revision_id}, 'set_notreviewed');
        },
        clearNotReviewedFlag: function (ci_id, revision_id) {
            return Restangular
                .one('ci', ci_id)
                .customPUT({revisionId: revision_id}, 'clear_notreviewed');
        },
        setMarkAsAppliedFlag: function (ci_id, revision_id) {
            return Restangular
                .one('ci', ci_id)
                .customPUT({revisionId: revision_id}, 'set_marked_as_applied');
        },
        clearMarkAsAppliedFlag: function (ci_id, revision_id) {
            return Restangular
                .one('ci', ci_id)
                .customPUT({revisionId: revision_id}, 'clear_marked_as_applied');
        },
        getPendingDecisions: function (ci_id, ci) {
            return Restangular
                .all('ci/' + ci_id + '/pending_possible_revisions')
                .customPOST(ci);
        },
        unstapleVersion: function (payload) {
            return Restangular
                .all('ci/' + payload.sourceId + '/unstaple_version')
                .customPOST({
                    sourceStatus: payload.sourceStatus,
                    targetId: payload.targetId,
                    reason: payload.reason
                });
        },
        getQueue: function (queue, owners) {
            return Restangular.all('ci/' + queue)
                .customPOST({
                    queue: queue,
                    owners: owners
                });
        },
        setStatus: function (ci_id, status, __docVersion) {

            return Restangular
                .one('ci', ci_id)
                .customPUT({value: status, __docVersion: __docVersion}, 'status');
        },
        setRotation: function (ci_id, rotation) {

            return Restangular
                .one('ci', ci_id)
                .customPUT({value: rotation}, 'rotation');
        },
        updateOwner: function (ci_id, user) {
            return Restangular
                .one('ci', ci_id)
                .customPUT({userName: user.userName, userId: user._id }, 'owner');
        },
        setNote: function (ci_id, note) {

            return Restangular
                .one('ci', ci_id)
                .customPUT({value: note}, 'note');
        },
        setActive: function (ci_id, active) {

            return Restangular
                .one('ci', ci_id)
                .customPUT({value: active}, 'active');
        },
        search: function (searchCriteria) {

            return Restangular
                .one('search')
                .customPOST(searchCriteria);
        },
        search_ignored: function (searchCriteria) {

            return Restangular
                .one('search_ignored')
                .customPOST(searchCriteria);
        },
        saveSearch: function (saveSearchCriteria) {
            return Restangular
                .one('save_search')
                .customPOST(saveSearchCriteria);
        },
        deleteSearch: function (payload) {
            return Restangular
                .one('delete_search')
                .customPOST(payload);
        },
        getSavedSearches: function () {
            return Restangular
                .one('get_saved_searches')
                .getList();
        },
        getSavedSearchById: function (search_id) {
            return Restangular
                .one('get_saved_search', search_id)
                .get();
        },
        getHistory: function (ci_id) {

            return Restangular
                .one('history', ci_id)
                .getList();
        },
        addToParkingLot: function (ci_id) {

            return Restangular
                .one('parkinglot', ci_id)
                .post();
        },
        removeFromParkingLot: function (ci_id) {

            return Restangular
                .one('parkinglot', ci_id)
                .remove();
        },
        getParkingLot: function () {
            // This returns the ParkingLot record
            return Restangular
                .one('parkinglot')
                .get();
        },
        getParkingLotCIs: function () {
            // This returns the actuals CIs in the ParkingLot record
            return Restangular
                .all('ci/parkinglot')
                .getList();
        },
        // These non-async methods may need a better place... kenmc
        getTypesForSelect: function (media_company_id) {

            return Restangular
                .all('media_company/' + media_company_id + '/ci_types')
                .getList()
		.then(function(types) {

		    var x = _.map(types, function (type) {
			return { name: type.label, value: type.value };
		    });
		    console.dir(x);
		    return x;
		});
        },
        getConditionsForSelect: function () {
            return _.map(_.keys(APP_CONFIG.CI.CONDITION), function (key) {
                return {name: nameFromKey(key), value: APP_CONFIG.CI.CONDITION[key]};
            });
        },
        getStatusesForSelect: function () {

            return _.map(_.keys(APP_CONFIG.CI.STATUS), function (key) {
                return {name: nameFromKey(key), value: APP_CONFIG.CI.STATUS[key]};
            });
        },
        getStatusesForSelectInLibrary: function () {

            // we only need IN_PROGRESS and COMPLETED in the status list!

            var statuses = this.getStatusesForSelect();

            _.remove(statuses, function (status) {
                return (status.value != APP_CONFIG.CI.STATUS.IN_PROGRESS && status.value != APP_CONFIG.CI.STATUS.COMPLETED);
            });

            return statuses;
        }
    };

    var Advertisers = {
        getMatches: function (search) {

            return Restangular
                .one('autocomplete/advertisers')
                .get({
                    search: search,
                    anywhere: true
                });
        },
        getExactMatch: function (search) {

            return Restangular
                .one('advertiser')
                .get({
                    search: search
                    //anywhere: true
                });
        }
    };

    var Agencies = {
        getById: function () {
        }
    };

    var MediaCompanies = {
        //getById: function() {
        //},
        getAll: function () {

            return Restangular
                .all('media_companies')
                .getList();
        },
        getAdvertisers: function (media_company_id) {

            return Restangular
                .all('media_company/' + media_company_id + '/advertisers')
                .getList();
        },

        getSearchAdvertisers: function (media_company_id, term) {

            return Restangular
                .all('media_company/' + media_company_id + '/searchAdvertisers/' + term)
                .getList();
        },

        getUsers: function (media_company_id) {

            return Restangular
                .all('media_company/' + media_company_id + '/users')
                .getList();
        },
        getCITypes: function (media_company_id) {

            return Restangular
                .all('media_company/' + media_company_id + '/ci_types')
                .getList();
        },
        getDefaultCIType: function (media_company_name) {

            // HACK for now

            if (media_company_name === 'Viacom') {
                return 'NATL';
            }
            else if (media_company_name === 'NBC Universal') {
                return 'NATL';
            }

            /*
             return Restangular
             .all('media_company/' + media_company_id + '/ci_types')
             .getList();
             */
        },
        getProgramsForNetwork: function (media_company_id, network_name) {

            return Restangular
                .all('media_company/' + media_company_id + '/network/' + network_name + '/programs')
                .getList();
        },
        getLastImportedUCR: function (media_company_id) {

            return Restangular
                .one('media_company/' + media_company_id + '/last_imported_ucr')
                .get();
        }
    };

    var Companies = {
        getByTypeAndId: function (type, id) {

            var api = {
                agency: 'agency',
                media_company: 'media_company'
            };

            var url = api[type];
            if (!url) {
                return;
            }

            return Restangular
                .one(url + '/' + id)
                .get();
        },
        getAllByAffiliationType: function (type) {

            var api = {
                agency: 'agencies',
                media_company: 'media_companies'
            };

            var url = api[type];
            if (!url) {
                return;
            }

            return Restangular
                .all(url)
                .getList();
        }
    };

    var Networks = {
        getAll: function () {

            return Restangular
                .all('networks')
                .getList();
        }
    };

    return {
        Users: Users,
        Annotations: Annotations,
        CI: CI,
        Advertisers: Advertisers,
        MediaCompanies: MediaCompanies,
        Agencies: Agencies,
        Companies: Companies,
        Networks: Networks
    };
}

angular
    .module('app')
    .factory('DataService', [
        'mvIdentity',
        'Restangular',
        'APP_CONFIG',
        DataService
    ]);
