/* jshint node:true */
'use strict';

module.exports = function (app) {

    //var adminCrl = require('../controllers/admin')(app);
    var advertiserCtrl = require('../controllers/advertiser')(app);
    var brandCtrl = require('../controllers/brand')(app);
    var companyCtrl = require('../controllers/company')(app);
    var groupCtrl = require('../controllers/group')(app);
    var networkCtrl = require('../controllers/network')(app);
    var programCtrl = require('../controllers/selling_title')(app);
    var userCtrl = require('../controllers/user')(app);

    var masterdataCtrl = require('../controllers/masterdata')(app);

    // 1. Users
    app.route('/api/admin/v1/users')
        .get(userCtrl.getUsers);

    app.route('/api/admin/v1/user/create')
        .post(userCtrl.createUser);

    app.route('/api/admin/v1/user/:uid')
        .get(userCtrl.getUserById)
        .put(userCtrl.updateUser)
        .delete(userCtrl.deleteUser);

    // search by username
    app.route('/api/admin/v1/user_name/:user_name')
        .get(userCtrl.getUserByName)
        .put(userCtrl.updateUser)
        .delete(userCtrl.deleteUser);

    app.route('/api/admin/v1/user/reset_password')
        .post(userCtrl.resetPassword);

    // 2. Groups
    app.route('/api/admin/v1/groups')
        .get(groupCtrl.getGroups);

    app.route('/api/admin/v1/group/create')
        .post(groupCtrl.createGroup);

    app.route('/api/admin/v1/group/:gid')
        .get(groupCtrl.getGroupById)
        .put(groupCtrl.updateGroup)
        .delete(groupCtrl.deleteGroup);

    app.route('/api/admin/v1/group_name/:group_name')
        .get(groupCtrl.getGroupByName)
        .put(groupCtrl.updateGroup)
        .delete(groupCtrl.deleteGroup);

    // Is it possible?
    app.route('/api/admin/v1/group/:gid/user/:uid')
        .get(groupCtrl.getGroupById)
        .put(groupCtrl.updateGroup)
        .delete(groupCtrl.deleteGroup);

    // 3. Companies
    app.route('/api/admin/v1/companies')
        .get(companyCtrl.getCompanies);

    app.route('/api/admin/v1/company/create')
        .post(companyCtrl.createCompany);

    app.route('/api/admin/v1/company/:cid')
        .get(companyCtrl.getCompanyById)
        .put(companyCtrl.updateCompany)
        .delete(companyCtrl.deleteCompany);

    app.route('/api/admin/v1/company_name/:company_name')
        .get(companyCtrl.getCompanyByName)
        .put(companyCtrl.updateCompany)
        .delete(companyCtrl.deleteCompany);

    app.route('/api/admin/v1/company/:cid/user/:uid')
        .get(companyCtrl.getCompanyById)
        .put(companyCtrl.updateCompany)
        .delete(companyCtrl.deleteCompany);

    // 4. Networks
    app.route('/api/admin/v1/networks')
        .get(masterdataCtrl.getNetworks);

    app.route('/api/admin/v1/network')
        .post(networkCtrl.createNetwork);

    app.route('/api/admin/v1/:cid/networks')
        .get(masterdataCtrl.getMediaCompanyNetworksById);
        //.put(masterdataCtrl.updateNetwork)
        //.delete(masterdataCtrl.deleteNetwork);

    app.route('/api/admin/v1/network_name/:network_name')
        .get(networkCtrl.getNetworkByName)
        .put(networkCtrl.updateNetwork)
        .delete(networkCtrl.deleteNetwork);

    app.route('/api/admin/v1/company/:cid/network/:nid')
        .get(companyCtrl.getCompanyById)
        .put(companyCtrl.updateCompany)
        .delete(companyCtrl.deleteCompany);

    // 5. Advertisers
    app.route('/api/admin/v1/advertisers')
        .get(advertiserCtrl.getAdvertisers);

    app.route('/api/admin/v1/advertisers')
        .post(advertiserCtrl.createAdvertiser);

    app.route('/api/admin/v1/advertiser/:aid')
        .get(advertiserCtrl.getAdvertiserById)
        .put(advertiserCtrl.updateAdvertiser)
        .delete(advertiserCtrl.deleteAdvertiser);

    app.route('/api/admin/v1/advertiser_name/:advertiser_name')
        .get(advertiserCtrl.getAdvertiserByName)
        .put(advertiserCtrl.updateAdvertiser)
        .delete(advertiserCtrl.deleteAdvertiser);

    // 6. Brands
    app.route('/api/admin/v1/brands')
        .get(brandCtrl.getBrands);

    app.route('/api/admin/v1/brands')
        .post(brandCtrl.createBrand);

    app.route('/api/admin/v1/brand/:bid')
        .get(brandCtrl.getBrandById)
        .put(brandCtrl.updateBrand)
        .delete(brandCtrl.deleteBrand);

    app.route('/api/admin/v1/brand_name/:brand_name')
        .get(brandCtrl.getBrandByName)
        .put(brandCtrl.updateBrand)
        .delete(brandCtrl.deleteBrand);

    //???
    app.route('/api/admin/v1/advertiser/:aid/brand/:bid')
        .get(advertiserCtrl.getAdvertiserById)
        .put(advertiserCtrl.updateAdvertiser)
        .delete(advertiserCtrl.deleteAdvertiser);


    // 7. Selling Titles
    app.route('/api/admin/v1/programs')
        .get(programCtrl.getSellingTitles);

    app.route('/api/admin/v1/program/create')
        .post(programCtrl.createSellingTitle);

    app.route('/api/admin/v1/program/:pid')
        .get(programCtrl.getSellingTitleById)
        .put(programCtrl.updateSellingTitle)
        .delete(programCtrl.deleteSellingTitle);

    app.route('/api/admin/v1/program_name/:program_name')
        .get(programCtrl.getSellingTitleByName)
        .put(programCtrl.updateSellingTitle)
        .delete(programCtrl.deleteSellingTitle);

};
