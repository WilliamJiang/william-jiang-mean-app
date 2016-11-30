/**
 * Created by PavaniKa on 3/19/2015.
 */

function CopyCoordinatorEditCIMetadataCtrl($scope,
                                           $rootScope,
                                           $modalInstance,
                                           $location,
                                           $routeParams,
                                           $log,
                                           mvIdentity,
                                           ciId,
                                           ci,
                                           CI,
                                           DataService,
                                           NotifierService,
                                           UtilsService,
                                           APP_CONFIG,
                                           metadata) {

    $scope.ci = ci;
    $scope.ciId = ciId;

    $scope.brands = [];
    $scope.programs = metadata.programs;
    $scope.types = metadata.types;

    $scope.disableBrand = true;
    $scope.disableTypeSelection = false;

    $scope.files_by_brand = false;
    $scope.files_by_program = false;
    $scope.add_to_parking_lot = false;

    $scope.selectedType = _.find($scope.types, function (_type) {
        //return _type.value === (ci.type ? ci.type : DataService.MediaCompanies.getDefaultCIType(mvIdentity.currentUser.affiliation.company.name));
        return _type._id === (ci.type_id ? ci.type_id : mvIdentity.currentUser.affiliation.company.default_ci_type_id);
    });

    // <editor-fold desc="Initial load of Advertiser, Brands, and Programs">
    /**
     * Advertiser & related Brand & Program info on page load
     */

        //this is used in isMetadataValid() function
        // to determine if the extracted advertiser is a valid one in DB.
    $scope.selectedAdvertiser = null;
    $scope.selectedBrand = null;
    function loadAdvertiser() {

        //TODO: READ - search Advertiser by Id and set!
        var advertiser = $scope.ci.advertiser;

        //get the correct matching advertiser
        DataService
            .Advertisers
            .getExactMatch(advertiser)
            .then(function (response) {
                var _advObj = response.results.advertiser;
                if (_advObj) {
                    //1. Advertiser
                    $scope.selectedAdvertiser = _advObj;
                    //TODO: READ - search Advertiser by Id and set!
                    //ci.advertiser = _advObj.advertiser;
                    //ci.advertiser_id = _advObj._id;

                    //Brands
                    $scope.files_by_brand = _advObj.files_by_brand;
                    $scope.brands = _.sortBy(_advObj.brands, function (i) { return i.name.toLowerCase(); });
                    //_advObj.brands;
                    //selected brand
                    $scope.selectedBrand = _.find($scope.brands, function (_brand) {
                        return _brand._id === $scope.ci.brand_id;
                    });

                    $scope.disableBrand = false;

                    //Programs
                    $scope.files_by_program = _advObj.files_by_program;
                    var _program = _.find($scope.programs, function (_program) {
                        return _program.name === $scope.ci.program;
                    });

                    if (_program) {
                        ci.program = _program.name;
                    }

                    //Type: We need to disable the Type if the selected
                    //advertiser has a 'default_ci_type'.
                    if(_advObj.default_ci_type && $scope.selectedType) {
                        $scope.disableTypeSelection = true;
                    }
                } else {
                    //reset advertiser info
                    ci.advertiser_id = '';
                    $scope.selectedAdvertiser = null;

                    //reset brand info
                    //ci.brand = ''; //this is to show the extracted brand till we select an advertiser
                    ci.brand_id = null;
                    $scope.selectedBrand = null;
                }
            });
    }

    loadAdvertiser();
    // </editor-fold>

    // <editor-fold desc="Advertisers type ahead">
    $scope.getAdvertisers = function (search) {
	
        return DataService
            .Advertisers
            .getMatches(search)
            .then(function (response) {
                return response.results.advertisers;
            });
    };

    /**
     * this is to reset the brand, program, and Type when the advertiser value is changed
     */
    $scope.onChangeAdvertiser = function () {
	
        //reset the values
        $scope.files_by_brand = false;
        $scope.files_by_program = false;

        //1. Type
        $scope.selectedType = null;
        $scope.disableTypeSelection = false;

        //2. Brand
        $scope.brands = [];
        ci.brand = ''; //this is to clear brand from UI when we clear the advertiser
        ci.brand_id = null;
        $scope.selectedBrand = null;
        $scope.disableBrand = true;

        //3. Clear Advertiser ID
        $scope.ci.advertiser_id = '';
        $scope.selectedAdvertiser = null;
    };
    
    /**
     * this is to update the advertiser of the ci
     * @param item
     * @param model
     * @param label
     */
    $scope.onSelectAdvertiser = function (item, model, label) {
        $scope.selectedAdvertiser = item;

        //1. Type: If there is a default ci type for this advertiser that will be selected
        $scope.selectedType = _.find($scope.types, function (_type) {
            //return _type.value === (item.default_ci_type ? item.default_ci_type : DataService.MediaCompanies.getDefaultCIType(mvIdentity.currentUser.affiliation.company.name));
            if(item.default_ci_type) {
                return _type.value === item.default_ci_type;
            }
        });
        //enforce default ci type
        if(item.default_ci_type && $scope.selectedType) {
            $scope.disableTypeSelection = true;
        } else {
            //fallback to the media company's default CI Type
            $scope.selectedType = _.find($scope.types, function (_type) {
                return _type._id === mvIdentity.currentUser.affiliation.company.default_ci_type_id;
            });
        }

        //2. Brand: brands for this advertiser will be used in Brands drop down
        $scope.files_by_brand = item.files_by_brand;
        $scope.brands = _.sortBy(item.brands, function (i) { return i.name.toLowerCase(); });
        //item.brands;
        $scope.disableBrand = false;

        //3. Program: this is to make Program field 'required'
        $scope.files_by_program = item.files_by_program;

        //4. Advertiser ID Write
        $scope.ci.advertiser_id = item._id;
    };
    // </editor-fold>

    // <editor-fold desc="Type Drop down">
    $scope.onChangeType = function (type) {
        $scope.selectedType = type;
    };
    // </editor-fold>

    // <editor-fold desc="Brands Drop down">
    $scope.onChangeBrand = function (brand) {
        //$scope.selectedBrand = brand;
        //reset brand & brand id
        $scope.selectedBrand = null;
        ci.brand_id = null;
    };
    $scope.onSelectBrand = function (brand) {
        $scope.selectedBrand = brand;
    };
    // </editor-fold>

    // <editor-fold desc="Program Drop down">
    $scope.onChangeProgram = function () {
        //$scope.selectedProgram = null;
    };
    $scope.onSelectProgram = function (program) {
        $scope.ci.program = program.name;
    };
    // </editor-fold>

    $scope.getNameFromKey = function (key) {
        return UtilsService.getNameFromKey(key);
    };

    $scope.OKbuttonClicked = false;

    // <editor-fold desc="Modal OK, CLOSE buttons">
    $scope.ok = function () {

        //Brand
        $scope.ci.brand = $scope.selectedBrand ? $scope.selectedBrand.name : '';
        $scope.ci.brand_id = $scope.selectedBrand ? $scope.selectedBrand._id : null;
	
        //TYPE might have been changed!
        $scope.ci.type = $scope.selectedType ? $scope.selectedType.value : '';
        $scope.ci.type_id = $scope.selectedType ? $scope.selectedType._id : '';

        //prevent double clicks!
        $scope.OKbuttonClicked = true;

        //check for pending possible revisions
        DataService.CI
            .getPendingDecisions($scope.ci._id, $scope.ci)
            .then(function (cis) {

                var count = 0;
                if (cis && _.isArray(cis)) {
                    _pendingDecisions = cis;
                    count = cis.length;
                }

                //console.log('Pending decisions count: ' + count);
                if (parseInt(count) === 0) {
                    //there are none, save it
                    saveMetadata();
                } else {
                    $scope.OKbuttonClicked = false;

                    //check if user wants to make a decision now!
                    //TODO: replace with designed confirmation.
                    var r = confirm("A potential revision must be evaluated before this change can be saved.\n\nClick OK to evaluate or Cancel to return to the Copy Instruction.");
                    if (r == true) {
                        openPossibleRevisionModal(_pendingDecisions);
                    } else {
                        //console.log('Stay on this CI.');
                    }
                }
            })
            .catch(function (error) {
                $scope.OKbuttonClicked = false;
                console.log('Error while getting pending decisions: ' + error);
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    function saveMetadata() {

        $scope.ci.type = $scope.selectedType ? $scope.selectedType.value : '';
        $scope.ci.type_id = $scope.selectedType ? $scope.selectedType._id : '';

        //TimeZone is set in app.js config
        var startDate = moment.tz($scope.ci.air_date_start,'America/New_York') || moment().startOf('day');
        var endDate = moment.tz($scope.ci.air_date_end,'America/New_York') || moment().startOf('day');

        $scope.ci.air_date_start = startDate;
        $scope.ci.air_date_end = endDate;

        //program, restrict to 100 characters
        $scope.ci.program = _.trunc($scope.ci.program, {length:100, omission: ''});

        //Advertiser
        //Air Dates
        //Type
        //$scope.ci.type = $scope.selectedType ? $scope.selectedType.value : '';
        //Brand
        //$scope.ci.brand = $scope.selectedBrand;
        //Program
        //$scope.ci.program = $scope.selectedProgram ? $scope.selectedProgram.name : '';

        $scope.ci
            .put()
            .then(function (ci) {
		
                if ($scope.add_to_parking_lot) {
		    
                    return DataService
			.CI
                        .addToParkingLot($scope.ci._id);
                }
                else {
                    return ci;
                }
            })
            .then(function (rv) {
		
                //send back the updated CI, needed to determine whether the CI Details needs to be closed or stay open!
                var _ci = _.isArray(rv) ? rv[0] : $scope.ci;

                NotifierService.notifySuccess('CI ' + _ci._id + ' metadata updated.');
                //pass the new CI to update it in the parent CI modal
                $modalInstance.close(_ci);
            })
            .then(function(error){
		
                if (error) {
                    $log.error(error);
                }
            });
    }

    //this will open the possible revision screen from here.
    function openPossibleRevisionModal(cis) {
	
        //console.log('Open the possible revision compare screen: ' + cis.length);
	
        var possibleRevisionCI = _.find(cis, function (_ci) {
            return _ci.possible_revision === true;
        });

        if (possibleRevisionCI) {
            //we use $rootScope because modal scope is isolated from the scope hierarchy!
            $rootScope.$broadcast('open-compare-revision', possibleRevisionCI._id);
        } else {
            //we only got the possibly revised/candidate CI, get the possible revision of it.
            var candidateCI = cis[0];

            DataService.CI
                .getPendingDecisions(candidateCI._id, candidateCI)
                .then(function (cis) {
                    //these are the possible revisions of the candidate, open the modal now.
                    openPossibleRevisionModal(cis);
                })
                .catch(function (error) {
                    console.log('Error while getting pending decisions of the candidate: ' + error);
                });
        }
    }

    // </editor-fold>

    $scope.isMetadataValid = function () {

        var bInValid = !_.isObject($scope.ci.air_date_start) ||
            !_.isObject($scope.ci.air_date_end) ||
            _.isNull($scope.selectedAdvertiser) || //_.isUndefined($scope.ci.advertiser) ||
            ($scope.files_by_brand && _.isNull($scope.selectedBrand)) ||
            ($scope.files_by_program && _.isUndefined($scope.ci.program)) ||
            _.isUndefined($scope.selectedType);

        //if (bInValid) { $scope.add_to_parking_lot = !bInValid; } //Can't add to parking lot until metadata is valid.
        //$log.debug('Is Metadata Invalid: ' + bInValid);
        return !bInValid;
    }
}

angular.module('trafficbridge.cc').
    controller('CopyCoordinatorEditCIMetadataCtrl',[
        '$scope',
        '$rootScope',
        '$modalInstance',
        '$location',
        '$routeParams',
        '$log',
        'mvIdentity',
        'ciId',
        'ci',
        'CI',
        'DataService',
        'NotifierService',
        'UtilsService',
        'APP_CONFIG',
        'metadata',
        CopyCoordinatorEditCIMetadataCtrl
    ]);
