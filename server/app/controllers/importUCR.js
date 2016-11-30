/* jshint node:true */
'use strict';

var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');
var R = require('ramda');
var Promise = require('bluebird');
var csv = require('fast-csv');
var _ = require('lodash');
var moment = require('moment');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var XLSX = require('xlsx');
var constants = require('../../constants');
var _CI = constants.CI;
var _UCR = constants.UCR;
var _COMPANY = constants.COMPANY;
var logger = require('../../utilities/logger');

////////////////////////////////////////////////////////////////////////////////

module.exports = function(app) {

    var ciCtrl = require('./ci')(app);
    var masterDataCtrl = require('./masterdata')(app);

    ////
    var config = app.locals.config;
    var db = app.locals.db;
    ////
    var Advertiser = db.AdvertiserBrand;
    var UCRImport = db.UCRImport;
    var CI = db.CI;
    var MediaCompany = db.MediaCompany;
    ////

    function writeS3ObjectToLocalTempFile(key) {

        // TODO reject!
        return new Promise(function(resolve,reject) {

            var params = {
                Bucket: config.aws.bucket.ucr,
                Key: key
            };

            var fn = '/tmp/' + uuid.v1();
            var file = fs.createWriteStream(fn);
            logger.debug(file,'file');

            file.on('end',function() {
                logger.debug('end...');
            });

            var rs = s3.getObject(params).createReadStream();

            rs.on('end',function() {
                resolve(fn);
            });

            rs.pipe(file);
        });
    }

    function startPostUpload(req,res) {

        var uploadData = req.body;

        var user = req.user;
        var media_company_id = req.user.affiliation.ref_id;

        logger.debug(uploadData,'uploadData');

        var ucrImport = {
            url: uploadData.location,
            media_company_id: media_company_id,
            imported_by: user._id
        };

        var __ucrImport;
        var fn;

        UCRImport
            .createAsync(ucrImport)
            .bind({})
            .then(function(_ucrImport) {

                logger.debug(_ucrImport,'_ucrImport');

                __ucrImport = _ucrImport;

                return writeS3ObjectToLocalTempFile(uploadData.key);
            })
            .then(function(_fn) {

                logger.debug(fn,'fn');

                fn = _fn;

                return getValidatorContext(user);
            })
            .then(function(validatorContext) {

                logger.debug(validatorContext,'validatorContext');

                var ext = path.extname(fn);

                if (ext === '.csv') {

                    return processCSVUCR(user,fn,validatorContext);
                }
                else {

                    // Using the media company name is obviously fragile.
                    // We may want to introduce a field into the media company
                    // like ucr_processor that is more fixed
                    // Also, may want to use this field to require the processor
                    // Instead of conditionals that resolve to function calls
                    // i.e. var processor = require(validatorContext.mediaCompany.ucr_processor);

                    if (validatorContext.mediaCompany.name === 'Viacom') {
                        return processViacomUCR(user,fn,validatorContext);
                    }
                    else if (validatorContext.mediaCompany.name === 'NBC Universal') {
                        return processNBCUUCR(user,fn,validatorContext);
                    }
                }
            })
            .then(function(processingResult) {

                logger.debug(processingResult,'processingResult');

                processingResult.messages = [];

                // Status errors are global UCR errors, not row specific
                // They are fatal, so we do no DB work and return error to user

                if (processingResult.fatalErrors.length > 0) {

                    res.send({
                        ucrImport: this._ucrImport,
                        processingResult: processingResult,
                        status: _UCR.STATUS.FATAL_ERROR
                    });
                }
                else {

                    // This a remnant from when the business requirement was to support
                    // multiple networks per UCR
                    var networksToClear = [ processingResult.networkInUCR ];

                    var that = this;

                    return ciCtrl
                        .clearUninstructedMatchesFromNetworks(networksToClear)
                        .then(function(rv) {

                            logger.debug(rv,'rv');

                            R.forEach(function(network) {
                                processingResult.messages.push('All previous Uninstructed Matches from network ' + network + ' were cleared.');
                            },networksToClear);

                            var promises = [];

                            R.forEach(function(key) {

                                var airDates = processingResult.criterias[key];

                                //Unroll key back into criteria
                                var parts = key.split('::');
                                logger.debug(parts,'parts');

                                R.forEach(function(airDate) {
                                    promises.push(findAndSetUninstructedMatches(req.user,parts,airDate));
                                },airDates);

                            },_.keys(processingResult.criterias));

                            return Promise.all(promises);
                        })
                        .then(function(rv2) {

                            logger.debug(rv2,'rv2');

                            res.send({
                                ucrImport: that._ucrImport,
                                processingResult: processingResult,
                                status: _UCR.STATUS.SUCCESS
                            });
                        })
                        .catch(function(error) {

                            logger.debug(error,'error');

                            return res.status(500).send({ error: error.toString() });
                        });
                }
            })
            .catch(function(error) {

                logger.debug(error,'error');

                return res.status(500).send({ error: error.toString() });
            });
    }

    function processViacomUCR(user,fn,validatorContext) {

        return Promise.attempt(function() {

            var workbook = XLSX.readFile(fn);

            var sheetNames = workbook.SheetNames;
            var worksheet = workbook.Sheets[sheetNames[0]]; // Only need first page

            var json = XLSX.utils.sheet_to_json(worksheet);
            console.log(json);

            // Sanity check
            if (json.length === 0 ||
                !json[0].Channel ||
                !json[0].Advertiser ||
                !json[0].Brand ||
                !json[0]['Inv. Code'] ||
                !json[0]['Order Type'] ||
                !json[0]['Air Date']) {

                logger.error('This does not appear to be a valid UCR.');

                return {
                    fatalErrors: [ 'This does not appear to be a valid UCR.' ]
                };
            }

            var rows = [];

            // Convert the JSON version of the Excel worksheet to the common format
            R.forEach(function(obj) {

                var channel = obj.Channel ? obj.Channel.toUpperCase() : null;

                // Temporary hacks to make existing XLS work

                if (channel === 'MTVJ') {
                    channel = 'MTV';
                }

                var type = obj['Order Type'] ? obj['Order Type'].toUpperCase() : null;

                if (type === 'DR') {
                    type = 'direct_response';
                }

                rows.push({
                    networkCallLetters: channel,
                    advertiser: obj.Advertiser ? obj.Advertiser.toUpperCase() : null,
                    brand: obj.Brand ? obj.Brand.toUpperCase() : null,
                    program: obj['Inv. Code'] ? obj['Inv. Code'].toUpperCase() : null,
                    type: type,
                    airDate: obj['Air Date']
                });
            },json);

            return _processUCR(user,rows,validatorContext);
        });
    }

    function processNBCUUCR(user,fn,validatorContext) {

        return Promise.attempt(function() {

            var workbook = XLSX.readFile(fn);

            var sheetNames = workbook.SheetNames;
            var worksheet = workbook.Sheets[sheetNames[0]]; // Only need first page

            var json = XLSX.utils.sheet_to_json(worksheet);
            console.log(json);

            // Sanity check
            if (json.length === 0 ||
                !json[0].Property ||
                !json[0].Advertiser ||
                !json[0].Brand ||
                !json[0]['Selling Name'] ||
                !json[0]['Comm. Type'] ||
                !json[0]['On Date']) {

                logger.error('This does not appear to be a valid UCR.');

                return {
                    fatalErrors: [ 'This does not appear to be a valid UCR.' ]
                };
            }

            var rows = [];

            // Convert the JSON version of the Excel worksheet to the common format
            R.forEach(function(obj) {

                rows.push({
                    networkCallLetters: 'BRAVO',//obj.Property ? obj.Property.toUpperCase() : null,
                    advertiser: obj.Advertiser ? obj.Advertiser.toUpperCase() : null,
                    brand: obj.Brand ? obj.Brand.toUpperCase() : null,
                    program: obj['Selling Name'] ? obj['Selling Name'].toUpperCase() : null,
                    type: obj['Comm. Type'] ? obj['Comm. Type'].toUpperCase() : null,
                    airDate: obj['On Date']
                });
            },json);

            return _processUCR(user,rows,validatorContext);
        });
    }

    function processCSVUCR(user,fn,validatorContext) {

        return csvParser(fn)
            .then(function(rows) {

                rows.shift(); // TODO Hack to remove headers, headers=true to csv didn't seem to work - kenmc

                return _processUCR(user,rows,validatorContext);
            });
    }

    function _processUCR(user,rows,validatorContext) {

        logger.debug(rows,'rows');

        // Fatal errors are used for UCR wide status error tracking
        var fatalErrors = [];
        // Row status is used for each row status error tracking
        var rowStatuses = [];
        // For valid rows, the criterias are the building blocks of the queries we need to run against the DB to find matches
        var criterias = {};
        //
        var networksToClear = [];

        var idx = 1;

        // Check if the row and it's data is valid, and build criteria objects for DB queries

        R.forEach(function(row) {

            var obj = row;

            obj.network = validatorContext.networkCallLettersToNameMap[obj.networkCallLetters]; // TODO convenience derived field - kenmc

            var rowStatus = { idx: idx, obj: obj, errors: [] }; //Used to track processing of each row for error/success reporting - kenmc

            var rowPassedValidation = validatorContext.validateRow(obj,rowStatus);
            //logger.debug(rowStatus,'rowStatus');

            rowStatuses.push(rowStatus);

            if (rowPassedValidation) {

                //It is possible for the UCR to have rows with matching metadata (minus airdates)
                //Therefore, we dedup this repeated data so we don't make duplicate database calls
                //We do this simply, by concating the metadata to make a unique key
                //Then we map this unique key to an array of air dates

                //Some fields in the UCR are not relevant to the find matching query, so remove them
                //i.e. network is a derived field, note is only for debugging
                var obj2 = _.omit(obj,[ 'network','airDate','note' ]);
                logger.debug(obj2,'obj2');

                var key = _.values(obj2).join('::');
                if (!criterias[key]) {
                    criterias[key] = [];
                }

                criterias[key].push(moment(obj.airDate).toDate());
            }

            idx++;
        },rows);

        logger.debug(rowStatuses,'rowStatuses');
        logger.debug(criterias,'criterias');

        logger.debug(rowStatuses.length,'rowStatuses.length');
        logger.debug(criterias.length,'criterias.length');	

        if (rowStatuses.length > 0 && _.keys(criterias).length === 0) {

	    // If every row in the UCR is an error, bypass the fatal errors section
        }
        else {

            // Check to see if the UCR contains more than one network, which is a fatal error

            var networksInUCR = {};
            R.forEach(function(key) {

                var parts = key.split('::');
                networksInUCR[parts[0]] = 1;
            },_.keys(criterias));

            logger.debug(_.keys(networksInUCR).length,'# networks');

            if (_.keys(networksInUCR).length > 1) {

                fatalErrors.push('Invalid UCR; multiple networks not supported.');
            }

            var networkInUCR = _.keys(networksInUCR)[0];
            logger.debug(networkInUCR,'networkInUCR');

            //logger.debug(user.affiliation,'user.affiliation');

            if (user.affiliation.type !== _COMPANY.TYPE.MEDIA_COMPANY) {

                fatalErrors.push('UCR import is only available to media company users.');
            }
            else {

                var x = validatorContext.networkCallLettersToNameMap[networkInUCR];
                logger.debug(validatorContext.networkCallLettersToNameMap,'x');
                logger.debug(x,'x');

                if (user.affiliation.metadata.active_network !== x) {

                    fatalErrors.push('Can only import a UCR for the currently selected network.');
                }
            }
        }
	
        logger.debug(fatalErrors,'fatalErrors');

        return {
            fatalErrors: fatalErrors,
            rowStatuses: rowStatuses,
            networkInUCR: networkInUCR,
            criterias: criterias
        };
    }

    function findAndSetUninstructedMatches(user,parts,airDate) {

        var _criteria = {
            network: parts[0],
            advertiser: parts[1],
            brand: parts[2],
            program: parts[3],
            type: parts[4],
            airDate: airDate
        };

        logger.debug(_criteria,'_criteria');

        // This is a redudant query, since we already look up the media company in getValidatorContext...

        var media_company_id = user.affiliation.ref_id;

        return masterDataCtrl
            ._getMediaCompanyById(media_company_id)
            .then(function(mediaCompany) {

                return ciCtrl
                    .findUninstructedMatches(mediaCompany,_criteria);
            })
            .then(function(cis) {

                logger.debug(cis,'cis');

                var promises = [];

                R.forEach(function(ci) {

                    ci = _.omit(ci,[ '__docVersion' ]);
                    ci.uninstructed_match = true;

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

                return Promise.all(promises);
            });
    }

    function csvParser(fn) {

        // Turn fast-csv events into a Promise

        return new Promise(function(resolve,reject) {

            var stream = fs.createReadStream(fn);

            var rows = [];

            var csvStream = csv(
                {
                    //headers: true,
                    delimiter: ',',
                    ignoreEmpty: true
                })
                .on("data",function(row) {

                    var obj = {
                        networkCallLetters: row[0],
                        advertiser: row[1],
                        brand: row[2],
                        program: row[3],
                        type: row[4],
                        airDate: row[5],
                        note: row[6] // Ignored, only for providing testing information - kenmc
                    };

                    logger.debug(obj,'obj');

                    rows.push(obj);
                })
                .on("end",function() {

                    resolve(rows);
                });

            stream.pipe(csvStream);
        });
    };

    // Get the data from the DB we'll need to perform validation

    function getValidatorContext(user) {

        var media_company_id = user.affiliation.ref_id;

        return masterDataCtrl
            ._getMediaCompanyById(media_company_id)
            .bind({})
            .then(function(mediaCompany) {

                this.mediaCompany = mediaCompany;

                // TODO This can be done in parallel w/ previous db call...
                return masterDataCtrl
                    ._getMediaCompanyAdvertisersById(media_company_id)
            })
            .then(function(advertisers) {

                this.advertisers = advertisers;

                // TODO This can be done in parallel w/ previous db call...
                return masterDataCtrl
                    ._getMediaCompanyCITypesById(media_company_id)
            })
            .then(function(types) {

                this.types = types;
            })
            .then(function() {

                var advertiserNames = _.map(this.advertisers,function(advertiser) {
                    return advertiser.advertiser;
                });

                var advertiserNameToBrandsMap = {};
                _.forEach(this.advertisers,function(advertiser) {
                    advertiserNameToBrandsMap[advertiser.advertiser] = advertiser.brands;
                });

                var networkNames = _.map(this.mediaCompany.networks,function(network) {
                    return network.names;
                });

                var networkCallLetters = _.map(this.mediaCompany.networks,function(network) {
                    return network.call_letters;
                });

                var _this = this;

                this.networkCallLettersToNameMap = {};
                var networkCallLettersToProgramsMap = {};

                _.forEach(this.mediaCompany.networks,function(network) {

                    _this.networkCallLettersToNameMap[network.call_letters] = network.name;
                    networkCallLettersToProgramsMap[network.call_letters] = _.map(network.programs,function(program) {
                        return program.name;
                    });
                });

                logger.debug(this.networkCallLettersToNameMap,'this.networkCallLettersToNameMap');
                logger.debug(this.networkCallLettersToNameMap,'this.networkCallLettersToNameMap');

                function isValidNetwork(obj) {
                    //logger.debug(networkCallLetters,'networkCallLetters');
                    //logger.debug(obj.networkCallLetters,'obj.networkCallLetters');
                    return _.contains(networkCallLetters,obj.networkCallLetters);
                }

                function isValidAdvertiser(obj) {

                    //logger.debug(advertiserNames,'advertiserNames');
                    //logger.debug(obj.advertiser,'obj.advertiser');

                    return _.contains(advertiserNames,obj.advertiser);
                }

                function isValidBrandForAdvertiser(obj) {

                    return _.contains(advertiserNameToBrandsMap[obj.advertiser],obj.brand);
                }

                function isValidProgram(obj) {

                    /*
                      var programsForNetwork = networkCallLettersToProgramsMap[obj.networkCallLetters];

                      //logger.debug(programsForNetwork,'programsForNetwork');
                      //logger.debug(obj.program,'obj.program');

                      return _.contains(programsForNetwork,obj.program);
                    */

                    return true; // Programs are now free-form, so no validation can occur against db
                }

                function isValidType(obj) {

                    // HACK
                    var validTypes = _.map(_this.types,function(type) {
                        return type.value;
                    });

                    //logger.debug(validTypes,'validTypes');

                    return _.contains(validTypes,obj.type);
                }

                function isValidAirDate(obj) {
                    return moment(obj.airDate).isValid();
                }

                // This function checks the data itself against masterdata and validates air date
                // For "fatal" errors, such as invalid network, we return from the function right away
                // Otherwise we collect as much errors as possible and return them all
                // This function returns false if errors were found, or true if the row and all of it's data is valid

                this.validateRow = function(obj,rowStatus) {

                    // Run basic checks against the row, such as to check that all columns are there
                    if (_.keys(obj).length < 6) {
                        rowStatus.errors.push('Invalid # of columns');
                        return false;
                    }

                    if (!isValidNetwork(obj)) {

                        rowStatus.errors.push('Invalid network');
                        return false;
                    }

                    var hasErrors = false;

                    if (!isValidAdvertiser(obj)) {

                        hasErrors = true;
                        rowStatus.errors.push('Invalid advertiser');
                    }
                    else {

                        // Advertiser is valid, but is the brand?
                        if (!isValidBrandForAdvertiser(obj)) {
                            hasErrors = true;
                            rowStatus.errors.push('Invalid brand');
                        }
                    }

                    if (!isValidProgram(obj)) {
                        hasErrors = true;
                        rowStatus.errors.push('Invalid program');
                    }

                    if (!isValidType(obj)) {
                        hasErrors = true;
                        rowStatus.errors.push('Invalid type');
                    }

                    if (!isValidAirDate(obj)) {
                        hasErrors = true;
                        rowStatus.errors.push('Invalid air date');
                    }

                    return !hasErrors; // return true if no errors
                }

                return this;
            });
    }

    return {
        startPostUpload: startPostUpload//,
        //processUCR: processUCR
    };
};
