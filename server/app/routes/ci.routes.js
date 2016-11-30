/* jshint node:true,  unused:false */
// william: parse jshint syntax check
'use strict';

module.exports = function (app) {

    var ciCtrl = require('../controllers/ci')(app);
    var config = app.locals.config;

    var pass_media_company_networks = function (req, res, next) {
        if (app.get('media_company_networks')) {
            req.media_company_networks = app.get('media_company_networks');
        }
        else {
            req.media_company_networks = []; //24 or 18
        }
        next();
    };

    app.all('/api/*', pass_media_company_networks);

    app.route('/api/parkinglot')
        .get(ciCtrl.getParkingLot);

    app.route('/api/parkinglot/:ci_id')
        .post(ciCtrl.addToParkingLot);

    app.route('/api/parkinglot/:ci_id')
        .delete(ciCtrl.removeFromParkingLot);

    //app.param('ci_id', ci_id);

    app.route('/api/ci')
        .get(ciCtrl.find);

    app.route('/api/ci/new')
        //.get(ciCtrl.findNew)
        .post(ciCtrl.queueForOwners);

    app.route('/api/ci/now')
        //.get(ciCtrl.findNow)
        .post(ciCtrl.queueForOwners);

    app.route('/api/ci/stuck')
        //.get(ciCtrl.findStuck)
        .post(ciCtrl.queueForOwners);

    app.route('/api/ci/stapled')
        .get(ciCtrl.findStapled);

    app.route('/api/ci/revision')
        //.get(ciCtrl.findRevision)
        .post(ciCtrl.queueForOwners);

    app.route('/api/ci/uninstructed')
        //.get(ciCtrl.findUninstructed)
        .post(ciCtrl.queueForOwners);

    app.route('/api/ci/parkinglot')
        //.get(ciCtrl.getParkingLotCIs)
        .post(ciCtrl.getParkingLotCIs);

    app.route('/api/ci/library')
        //.get(ciCtrl.findLibrary)
        .post(ciCtrl.findLibrary);

    app.route('/api/ci/completed')
        .get(ciCtrl.findCompleted);

    app.route('/api/ci/archived')
        .get(ciCtrl.findArchived);

    app.route('/api/ci/emails')
        //.get(ciCtrl.findEmails)
        .post(ciCtrl.findEmails);

    app.route('/api/ci/counted')
        .get(ciCtrl.counted);

    app.route('/api/ci/counts')
        .post(ciCtrl.countsForOwners);

    //william: ingest security
    app.route('/api/s3/:ci_id/:type')
        .get(ciCtrl.fetchPdf);

    //app.get('/api/ci/:id',ciCtrl.findById);
    app.route('/api/ci/:id')
        .get(ciCtrl.findByIdAndUser)
        .put(ciCtrl.update);

    //app.param('id', req.session.passport.user);

    app.route('/api/ci/:id/status')
        .put(ciCtrl.setStatus);

    app.route('/api/ci/:id/rotation')
        .put(ciCtrl.setRotation);

    app.route('/api/ci/:id/note')
        .put(ciCtrl.setNote);

    app.route('/api/ci/:id/active')
        .put(ciCtrl.setActive);

    app.route('/api/ci/:id/owner')
        .put(ciCtrl.updateOwner);

    app.route('/api/ci/:id/stapled_cis')
        .get(ciCtrl.getStapledCIs);

    app.route('/api/ci/:id/staple')
        .post(ciCtrl.staple);

    app.route('/api/ci/:id/possible_revisions')
        .get(ciCtrl.possibleRevisions);

    app.route('/api/ci/:id/possibly_revised')
        .get(ciCtrl.possiblyRevisedCandidates);

    app.route('/api/ci/:id/staple_revisions')
        .post(ciCtrl.stapleRevisions);

    app.route('/api/search')
        .post(ciCtrl.search);

    app.route('/api/search_ignored')
        .post(ciCtrl.searchIgnoredCIs);

    app.route('/api/save_search')
        .post(ciCtrl.saveSearch);

    app.route('/api/delete_search')
        .post(ciCtrl.deleteSearch);

    app.route('/api/get_saved_searches')
        .get(ciCtrl.getSavedSearches);

    app.route('/api/get_saved_search/:id')
        .get(ciCtrl.getSavedSearchById);

    app.route('/api/history/:id')
        .get(ciCtrl.history);

    app.route('/api/ci/:id/clear_pending_revision')
        .put(ciCtrl.clearPendingRevision);

    app.route('/api/ci/:id/clear_uninstructed_match')
        .put(ciCtrl.clearUninstructedMatch);

    app.route('/api/ci/:id/set_stuck')
        .put(ciCtrl.setStuckFlag);

    app.route('/api/ci/:id/clear_stuck')
        .put(ciCtrl.clearStuckFlag);

    app.route('/api/ci/:id/set_notreviewed')
        .put(ciCtrl.setNotReviewedFlag);

    app.route('/api/ci/:id/clear_notreviewed')
        .put(ciCtrl.clearNotReviewedFlag);

    app.route('/api/ci/:id/set_marked_as_applied')
        .put(ciCtrl.setMarkedAsAppliedFlag);

    app.route('/api/ci/:id/clear_marked_as_applied')
        .put(ciCtrl.clearMarkedAsAppliedFlag);

    app.route('/api/ci/:id/pending_possible_revisions')
        .post(ciCtrl.getPossibleRevisions_PendingDecision);

    app.route('/api/ci/:id/unstaple_version')
        .post(ciCtrl.unstapleVersion);

};