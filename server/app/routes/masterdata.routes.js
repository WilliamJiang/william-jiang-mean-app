/* jshint node:true */
'use strict';

module.exports = function (app) {

    var masterdataCtrl = require('../controllers/masterdata')(app);

    app.route('/api/agencies')
        .get(masterdataCtrl.getAgencies);

/*    app.route('/api/media_companies')
        .get(masterdataCtrl.getMediaCompanies);

    app.route('/api/networks')
        .get(masterdataCtrl.getNetworks);*/

    app.route('/api/agency/:id')
        .get(masterdataCtrl.getAgencyById);

    app.route('/api/media_company/:id')
        .get(masterdataCtrl.getMediaCompanyById);

    app.route('/api/media_company/:id/users')
        .get(masterdataCtrl.getMediaCompanyUsersById);

    app.route('/api/media_company/:id/networks')
        .get(masterdataCtrl.getMediaCompanyNetworksById);

    app.route('/api/media_company/:media_company_id/network/:network_name/programs')
        .get(masterdataCtrl.getNetworkProgramsById);

    app.route('/api/agency/:id/advertisers')
        .get(masterdataCtrl.getAgencyAdvertisersById);

    app.route('/api/media_company/:id/advertisers')
        .get(masterdataCtrl.getMediaCompanyAdvertisersById);

    app.route('/api/media_company/:id/searchAdvertisers/:term')
        .get(masterdataCtrl.getMediaCompanyAdvertisersBySearch);

    app.route('/api/media_company/:id/ci_types')
    	.get(masterdataCtrl.getMediaCompanyCITypesById);

    app.route('/api/media_company/:id/last_imported_ucr')
        .get(masterdataCtrl.getLastImportedUCR);

    app.route('/api/advertiser')
        .get(masterdataCtrl.getAdvertiser);
    
    app.route('/api/autocomplete/advertisers')
        .get(masterdataCtrl.getAdvertisersByIdForAutoComplete);
};
