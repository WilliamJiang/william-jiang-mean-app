/* jshint node:true */
'use strict';

var _ = require('lodash');
var constants = require('../../constants');
var _COMPANY = constants.COMPANY;
var _utils = require('../../utilities/misc');
var logger = require('../../utilities/logger');

// Underscore functions are effectively service calls, since they are not coupled to Express - kenmc

////////////////////////////////////////////////////////////////////////////////

// All strings that are sent by user must be escaped! kenmc
function escapeRegEx(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

////////////////////////////////////////////////////////////////////////////////

module.exports = function(app) {

    ////
    var db = app.locals.db;
    ////    
    var Agency = db.Agency;
    var Advertiser = db.AdvertiserBrand;
    var MediaCompany = db.MediaCompany;
    var User = db.User;
    ////

    function _getAgencies() {

        return Agency
            .find()
            .sort('name')
            .execAsync()
    }

    function getAgencies(req,res) {

        _getAgencies()
            .then(function(agencies) {
                return res.send(agencies);
            })
            .catch(function(error) {
                return res.status(500).send({ error: error.toString() });
            });
    }

    function _getMediaCompanies() {

        return MediaCompany
            .find()
            .sort('name')
            .execAsync();
    }

    function getMediaCompanies(req,res) {

        _getMediaCompanies()
            .then(function(mediaCompanies) {

                return res.send(mediaCompanies);
            })
            .catch(function(error) {
                return res.status(500).send({ error: error.toString() });
            });
    }

    function getNetworks(req,res) {

        _getMediaCompanies()
            .then(function(mediaCompanies) {

                // TODO This can be improved... kenmc
                var networks = _.flatten(_.map(mediaCompanies,function(mediaCompany) {
                    return mediaCompany.networks.toObject();
                }));

                return res.send(networks);
            })
            .catch(function(error) {
                return res.status(500).send({ error: error.toString() });
            });
    }

    function _getPrograms() {
    }

    function getPrograms(req,res) {

        // Schema has changed - kenmc

        /*
         MediaCompany
         .find()
         .sort('name')
         .execAsync()
         .then(function(mediaCompanies) {

         // TODO This can be improved... kenmc
         var programs = _.flatten(_.map(mediaCompanies,function(mediaCompany) {
         return mediaCompany.programs.toObject();
         }));

         return res.send(programs);
         })
         .catch(function(error) {
         return res.status(500).send({ error: error.toString() });
         });
         */

        return res.status(501);
    }

    function _getAgencyById(id) {

        var query = { _id: id };

        return Agency
            .findOneAsync(query);
    }

    function getAgencyById(req,res) {

        var id = req.params.id;

        _getAgencyById(id)
            .then(function(mediaCompany) {
                return res.send(mediaCompany);
            })
            .catch(function(error) {
                return res.status(500).send({ error: error.toString() });
            });
    }

    function _getMediaCompanyById(id) {

        var query = { _id: id };

        return MediaCompany
            .findOneAsync(query);
    }

    function getMediaCompanyById(req,res) {

        var id = req.params.id;

        _getMediaCompanyById(id)
            .then(function(mediaCompany) {

                return res.send(mediaCompany);
            })
            .catch(function(error) {

                return res.status(500).send({ error: error.toString() });
            });
    }

    function _getMediaCompanyUsersById(mediaCompanyId) {

        var query = {
            'affiliation.type': 'media_company', //'mediaCompany',
            'affiliation.ref_id': mediaCompanyId
        };

        return User
            .findAsync(query)
    }

    function getMediaCompanyUsersById(req,res) {

        var mediaCompanyId = req.params.id;

        _getMediaCompanyUsersById(mediaCompanyId)
            .then(function(users) {

                //return res.send(users);
                var _users = [];

                _.forEach(users, function(user){
                    _users.push({
                        'userName': user.userName,
                        'firstName': user.firstName,
                        'lastName': user.lastName,
                        'fullName': _.capitalize(_.trim(user.firstName)).charAt(0) + '. ' + _.capitalize(_.trim(user.lastName))
                    });
                });

                return res.send(_users);
            })
            .catch(function(error) {

                return res.status(500).send({ error: error.toString() });
            });
    }

    function getMediaCompanyNetworksById(req,res) {

        var cid = req.params.cid;

        _getMediaCompanyById(cid)
            .then(function(mediaCompany) {

                return res.send(mediaCompany.networks);
            })
            .catch(function(error) {

                return res.status(500).send({ error: error.toString() });
            });
    }

    function getNetworkProgramsById(req,res) {

        var mediaCompanyId = req.params.media_company_id;
        var networkName = req.params.network_name;

        _getMediaCompanyById(mediaCompanyId)
            .then(function(mediaCompany) {

                var map = {};

                _.forEach(mediaCompany.networks,function(network) {
                    map[network.name] = network.programs;
                });

                var programs = map[networkName];

                return res.send(programs);
            })
            .catch(function(error) {

                return res.status(500).send({ error: error.toString() });
            });
    }

    function _getAgencyAdvertisersById(agencyId) {

        var query = {
            agency_id: agencyId
        };

        return Advertiser
            .findAsync(query);
    }

    function getAgencyAdvertisersById(req,res) {

        var agencyId = req.params.id;

        _getAgencyAdvertisersById(agencyId)
            .then(function(advertisers) {

                logger.debug(advertisers,'advertisers');

                return res.send(advertisers);
            })
            .catch(function(error) {

                logger.error(error,'error');

                return res.status(500).send({ error: error.toString() });
            });
    }

    function _getMediaCompanyAdvertisersById(mediaCompanyId) {

        var query = {
            media_company_id: mediaCompanyId
        };

        return Advertiser
            .findAsync(query);
    }

    function getMediaCompanyAdvertisersById(req,res) {

        var mediaCompanyId = req.params.id;

        _getMediaCompanyAdvertisersById(mediaCompanyId)
            .then(function(advertisers) {

                logger.debug(advertisers,'advertisers');

                return res.send(advertisers);
            })
            .catch(function(error) {

                logger.error(error,'error');

                return res.status(500).send({ error: error.toString() });
            });
    }

    function _getAdvertisersByIdForAutoComplete(companyType,companyId,regExText) {

        var query = {
            advertiser: regExText
        };

        if (companyType === _COMPANY.TYPE.AGENCY) {
            query.agency_id = companyId;
        }
        else if (companyType === _COMPANY.TYPE.MEDIA_COMPANY) {
            query.media_company_id = companyId;
        }

        //logger.debug(query,'query');

        return Advertiser
            .findAsync(query);
    }

    function getAdvertisersByIdForAutoComplete(req,res) {

        // Input for the regex is coming from the user, so let's escape it to prevent invalid RegExs. kenmc

        var companyType = req.user.affiliation.type;
        var companyId = req.user.affiliation.ref_id;

        var searchText = escapeRegEx(req.query.search);
        var regExText = new RegExp(searchText,'i');

        _getAdvertisersByIdForAutoComplete(companyType,companyId,regExText)
            .then(function(advertisers) {

                logger.debug(advertisers.length,'advertisers');

                return res.send({
                    status: 'SUCCESS',
                    results: {
                        advertisers: advertisers
                    }
                });
            })
            .catch(function(error) {

                logger.error(error,'error');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });

        /* return res.send({
         status: 'SUCCESS',
         advertisers: []
         });*/
    }

    /**
     * this is used to load the advertiser in the metadata modal
     * for the initial load.
     */
    function _getAdvertiser(companyType,companyId,regExText) {

        var query = {
            advertiser: regExText
        };

        if (companyType === _COMPANY.TYPE.AGENCY) {
            query.agency_id = companyId;
        }
        else if (companyType === _COMPANY.TYPE.MEDIA_COMPANY) {
            query.media_company_id = companyId;
        }

        return Advertiser
            .findOneAsync(query);
    }

    function getAdvertiser(req,res) {

        var companyType = req.user.affiliation.type;
        var companyId = req.user.affiliation.ref_id;

        var searchText = _utils.escapeRegEx(req.query.search);
        var regExText = new RegExp(searchText,'i');

        _getAdvertiser(companyType,companyId,regExText)
            .then(function(advertiser) {

                //logger.debug(advertiser, 'advertiser');

                return res.send({
                    status: 'SUCCESS',
                    results: {
                        advertiser: advertiser
                    }
                });
            })
            .catch(function(error) {

                logger.error(error,'error');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function _getLastImportedUCR(media_company_id) {

        var query = {
            media_company_id: media_company_id
        };

        return UCRImport
            .find(query)
            .sort({ created_at: -1 })
            .limit(1)
            .execAsync();
    }

    function getLastImportedUCR(req,res) {

        var mediaCompanyId = req.params.id;

        _getLastImportedUCR(mediaCompanyId)
            .then(function(ucrImport) {

                return res.send(ucrImport.length > 0 ? ucrImport[0] : null);
            })
            .catch(function(error) {

                return res.status(500).send({ error: error.toString() });
            });
    }

    ////////////////////////////////////////////////////////////////////////////////

    /**
     * william:
     *   The function starts with '_' should be private function, so don't need to expose.
     */
    return {
        getAgencies: getAgencies,
        getMediaCompanies: getMediaCompanies,
        getNetworks: getNetworks,
        getPrograms: getPrograms,
        getAgencyById: getAgencyById,
        getMediaCompanyById: getMediaCompanyById,
        getMediaCompanyUsersById: getMediaCompanyUsersById,
        getMediaCompanyNetworksById: getMediaCompanyNetworksById,
        getNetworkProgramsById: getNetworkProgramsById,
        getAgencyAdvertisersById: getAgencyAdvertisersById,
        getMediaCompanyAdvertisersById: getMediaCompanyAdvertisersById,
        getAdvertiser: getAdvertiser,
        getAdvertisersByIdForAutoComplete:  getAdvertisersByIdForAutoComplete,
        getLastImportedUCR: getLastImportedUCR
    };
};
