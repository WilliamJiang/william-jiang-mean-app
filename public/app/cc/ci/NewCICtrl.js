/**
 * Created by PavaniKa on 4/1/2015.
 */

function NewCICtrl($scope,
                   $rootScope,
                   $modal,
                   $modalInstance,
                   $routeParams,
                   $location,
                   $log,
                   DataService,
                   NotifierService,
                   UtilsService,
                   mvIdentity,
                   ciId,
                   ci,
                   metadata,
                   APP_CONFIG) {

    'use strict';

    $scope.$on('$includeContentLoaded', function (event, url, c, d) {
        //$log.debug('NewCICtrl $includeContentLoaded...');
        if (TPVTB.AddScrollingToNewCIModal && _.isFunction(TPVTB.AddScrollingToNewCIModal)) {
            //this is defined in home.js from Agility!
            TPVTB.AddScrollingToNewCIModal();
        }

        //Load the advertiser data of this CI
        loadAdvertiser();
        loadPDFDocument();
    });

    $scope.ciId = ciId;
    $scope.ci = ci;
    $scope.IS_FILING_SCREEN = true; //this is used in pdf rotation

    $scope.users = metadata.users;

    //Add Unassigned to this list
    $scope.users.splice(0, 0, {
        '_id': null,
        'userName': 'UNKNOWN',
        'firstName': 'Unknown',
        'lastName': '',
        'fullName': 'Unknown'
    });

    //Default current user as CI's owner if there is no owner!
    //console.dir(mvIdentity.currentUser);
    $scope.currentUser = {
        'userName': mvIdentity.currentUser.userName,
        'firstName': mvIdentity.currentUser.firstName,
        'lastName': mvIdentity.currentUser.lastName,
        'fullName': UtilsService.getFullNameOfUser(mvIdentity.currentUser)
    };
    $scope.ci.owner = $scope.ci.owner || $scope.currentUser.userName;
    $scope.currentOwner = _.find($scope.users, function (_user) {
        return _user.userName === $scope.ci.owner;
    });

    //$scope.metadata = metadata;
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

    //this is used in isMetadataValid() function
    // to determine if the extracted advertiser is a valid one in DB.
    $scope.selectedAdvertiser = null;
    $scope.selectedBrand = null;
    // <editor-fold desc="Initial load of Advertiser, Brands, and Programs">
    function loadAdvertiser() {

        var advertiser = $scope.ci.advertiser;
        if (!advertiser) {
            return;
        }

        //get the correct matching advertiser
        DataService
            .Advertisers
            .getExactMatch(advertiser)
            .then(function (response) {
                //$log.debug('NewCICtrl loadAdvertiser...');

                var _advObj = response.results.advertiser;
                if (_advObj) {
                    //1. Advertiser
                    $scope.selectedAdvertiser = _advObj;
                    ci.advertiser = _advObj.advertiser;
                    ci.advertiser_id = _advObj._id;

                    //2. Brands
                    $scope.files_by_brand = _advObj.files_by_brand;
                    $scope.brands = _.sortBy(_advObj.brands, function (i) { return i.name.toLowerCase(); });
                        //_advObj.brands;
                    //selected brand
                    $scope.selectedBrand = _.find($scope.brands, function (_brand) {
                        return _brand._id === $scope.ci.brand_id;
                    });
                    $scope.disableBrand = false;

                    //3. Programs
                    $scope.files_by_program = _advObj.files_by_program;
                    var _program = _.find($scope.programs, function (_program) {
                        return _program.name === $scope.ci.program;
                    });

                    if (_program) {
                        ci.program = _program.name;
                    }

                    //TODO: Type: If a saved CI is loaded again, we need to disable the Type if the selected
                    //advertiser has a 'default_ci_type'.
                    /*if(_advObj.default_ci_type && $scope.selectedType) {
                     $scope.disableTypeSelection = true;
                     }*/
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

        //3. Advertiser
        $scope.ci.advertiser_id = '';
        $scope.selectedAdvertiser = null;
    };

    /**
     * this is to update the advertiser of the ci
     * @param item
     */
    $scope.onSelectAdvertiser = function (item, modal, label) {
        $scope.selectedAdvertiser = item;
        //1. Type: If there is a default ci type for this advertiser that will be selected
        $scope.selectedType = _.find($scope.types, function (_type) {
            //return _type.value === (item.default_ci_type ? item.default_ci_type : DataService.MediaCompanies.getDefaultCIType(mvIdentity.currentUser.affiliation.company.name));
            if (item.default_ci_type) {
                return _type.value === item.default_ci_type;
            }
        });
        //enforce default ci type
        if (item.default_ci_type && $scope.selectedType) {
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
    $scope.onFocusBrand = function () {
        //console.log('focus: ' + $scope.ci.brand);
    };
    $scope.onChangeBrand = function () {
        //console.log('change: ' + $scope.ci.brand);
        //reset brand & brand id
        $scope.selectedBrand = null;
        ci.brand_id = null;
    };
    $scope.onBlurBrand = function () {
        //console.log('blur: ' + $scope.ci.brand);
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

    $scope.onChangeOwner = function (newOwner) {
        $scope.currentOwner = newOwner;
        $scope.ci.owner = newOwner.userName;
        $scope.ci.owner_id = newOwner._id;

        //if selected user is current user, uncheck the 'not me' checkbox.
        /*if ($scope.ci.owner === $scope.currentUser.userName) {
         $scope.ci.notMeOptionChecked = false;
         }*/
    };
    $scope.isFilingAllowed = function () {
        var bFilingAllowed = $scope.ci.owner === $scope.currentUser.userName;
        if (!bFilingAllowed) {
            $scope.add_to_parking_lot = bFilingAllowed;
        } //Can't add to parking lot until filing is allowed.
        return bFilingAllowed;
    };
    $scope.onNotMeClick = function (event) {
        //reset the owner!
        $scope.ci.owner = '';
        $scope.currentOwner = null;
    };
    /**
     * this is to enable/disable the save button
     * @returns {boolean}
     */
    $scope.isMetadataValid = function () {

        var bInValid = !_.isObject($scope.ci.air_date_start) || !_.isObject($scope.ci.air_date_end) ||
            _.isNull($scope.selectedAdvertiser) ||
            ($scope.files_by_brand && _.isNull($scope.selectedBrand)) ||
            ($scope.files_by_program && _.isUndefined($scope.ci.program)) ||
            _.isUndefined($scope.selectedType);

        if (bInValid) {
            $scope.add_to_parking_lot = !bInValid;
        } //Can't add to parking lot until metadata is valid.
        return !bInValid;
    };

    //<editor-fold desc="Button Events">
    $scope.modalInstance = $modalInstance;
    /**
     * this is to close the modal
     */

    $scope.ok = function () {

        $modalInstance.close('close');
    };
    /**
     * this is to dismiss the modal
     */
    $scope.cancel = function () {

        $modalInstance.dismiss('cancel');
    };
    /**
     * this is to set the CI as Ignored
     */
    $scope.onIgnoreClick = function () {
        DataService.CI
            .setStatus($scope.ci._id, APP_CONFIG.CI.STATUS.IGNORED, $scope.ci.__docVersion)
            .then(function (ci) {

                NotifierService.notifySuccess('CI ' + $scope.ci._id + ' status set to ignore.');
                //$location.path('/cc/home/library');
                $modalInstance.close('close');
            });
    };
    /**
     * this is to save metadata of CI
     */
    $scope.saveButtonClicked = false;
    $scope.onSaveClick = function () {

        //prevent double clicks!
        $scope.saveButtonClicked = true;
        
        //Brand
        $scope.ci.brand = $scope.selectedBrand ? $scope.selectedBrand.name : '';
        $scope.ci.brand_id = $scope.selectedBrand ? $scope.selectedBrand._id : null;
        //Type
        $scope.ci.type = $scope.selectedType ? $scope.selectedType.value : '';
        $scope.ci.type_id = $scope.selectedType ? $scope.selectedType._id : '';

        //Owner
        $scope.ci.owner = $scope.currentOwner.userName;
        $scope.ci.owner_id = $scope.currentOwner._id;

        //TimeZone is set in app.js config
        var startDate = moment.tz($scope.ci.air_date_start, 'America/New_York') || moment().startOf('day');
        var endDate = moment.tz($scope.ci.air_date_end, 'America/New_York') || moment().startOf('day');

        $scope.ci.air_date_start = startDate; //$scope.ci.air_date_start || moment().startOf('day'); //.format('MM/DD/YYYY');
        $scope.ci.air_date_end = endDate; //$scope.ci.air_date_end || moment().startOf('day'); //.format('MM/DD/YYYY');

        //program, restrict to 100 characters
        $scope.ci.program = _.trunc($scope.ci.program, {length: 100, omission: ''});

        /*PavaniKa - new logic for Ignored CIs*/
        if ($scope.isMetadataValid() && $scope.isFilingAllowed()) {
            //this means logged in user and CI owner are same, and File button is shown so
            //set CI Status back to delivered, this is to kick in the possible revision logic
            $scope.ci.status = APP_CONFIG.CI.STATUS.DELIVERED;
        }

        //check for pending possible revision decisions, if any.
        var _pendingDecisions = [];

        //see if the owner of the CI is the logged in user.
        if ($scope.ci.owner === $scope.currentUser.userName) {

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
                        saveCI();
                    } else {
                        $scope.saveButtonClicked = false;
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
                    console.log('Error while getting pending decisions: ' + error);
                });

        } else {
            //just save the metadata
            saveCI();
        }
    };

    //this will save/file the CI.
    function saveCI() {

        //set undefined brand&program to ''
        if (_.isNull($scope.selectedBrand)) {
            $scope.ci.brand = ''; //this is to prevent the brandSlot getting displayed in the CI Cards
            $scope.ci.brand_id = null;
        }

        $scope.ci
            .put()
            .then(function (ci) {
                if ($scope.add_to_parking_lot) {
                    return DataService.CI
                        .addToParkingLot($scope.ci._id);
                }
                else {
                    return ci;
                }
            })
            .then(function (rv) {

                NotifierService.notifySuccess('CI ' + $scope.ci._id + ' metadata updated.');
                $scope.saveButtonClicked = false;
                $scope.ok();
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

    $scope.showViewSelectButton = ($scope.ci.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
    $scope.ci.ingest.files.original &&
    $scope.ci.ingest.files.email);

    $scope.hasEmail = ($scope.ci.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
    $scope.ci.ingest.files.email);

    $scope.bShowEmail = ($scope.ci.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL && !$scope.ci.ingest.files.original);

    $scope.onViewEmailClick = function ($event) {
        $scope.bShowEmail = !$scope.bShowEmail;
    };
    //</editor-fold>

    //<editor-fold desc="PDF JS">
    var $jQL = jQuery.noConflict();
    var pdfWrapperContent = "<div id='pdfContainer' class='pdf-content' style='z-index:0;overflow:inherit;'></div>" +
        "<img id='imgAnnotatable' class='annotatable' style='opacity:0;position:absolute;' " +
        "src='../../custom-vendor/annotorious/transparent.gif'>";

    $scope.isCIStuck = false;
    $scope.ADD_ANNOTATIONS = true;
    $scope.ANNOTATORJS_LOADED = false;

    $scope.scale = 999; //1.25;
    $scope.$canvas = $jQL("<canvas></canvas>");

    function loadPDFDocument() {

        //this is to reset the previous values
        PDFJS.disableWorker = true;

        $scope.PDFDOC = {
            pdfDoc: null,
            pageNum: 1,
            pageCount: 1,
            pageRendering: false,
            pageNumPending: null
        };

        var pdfURL = ci.ingest.files.common ? ci.ingest.files.common.url : null;
        var ciType = ci.ingest.files.common ? ci.ingest.files.common :
            ci.ingest.files.original ? ci.ingest.files.original :
                ci.ingest.files.email ? ci.ingest.files.email : null;

        if (pdfURL) {
            //append canvas here, so we don't have to append it again!
            $jQL("#pdfWrapper").append($scope.$canvas);
            UtilsService.showProgressBar('new_ci_modal_progress');

            var purl = '/api/s3/' + $scope.ciId + '/' + ciType;
            PDFJS
                .getDocument(purl)
                .then(function (pdfDoc_) {
                    $scope.$apply(function () {
                        $scope.PDFDOC.pdfDoc = pdfDoc_;
                        $scope.PDFDOC.pageCount = $scope.PDFDOC.pdfDoc.numPages;
                    });
                    // Initial/first page rendering
                    renderPage($scope.PDFDOC.pageNum);
                });

        } else {
            UtilsService.hideProgressBar('new_ci_modal_progress');
            //TODO: show that URL is missing on the CI??
        }
    }

    function renderPage(num) {

        $scope.ciId = $scope.ci._id;
        $scope.rotate = $scope.ci.rotation;
        $scope.PDFDOC.pageRendering = true;
        //$jQL("#pdfWrapper").html(pdfWrapperContent);

        // Using promise to fetch the page
        $scope.PDFDOC.pdfDoc.getPage(num)
            .then(function (page) {
                var wrapperWidth = angular.element('#pdfWrapper').width();
                $scope.scale = $scope.scale == 999 ? (wrapperWidth / page.getViewport(1.0).width) : $scope.scale;

                var viewport = page.getViewport($scope.scale, $scope.rotate);
                var canvas = $scope.$canvas.get(0);
                var context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                page.getTextContent()
                    .then(function (textContent) {

                        //var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0); //The second zero is an index identifying
                        //the page. It is set to page.number - 1.
                        //textLayer.setTextContent(textContent);

                        var renderContext = {
                            canvasContext: context,
                            viewport: viewport
                            //textLayer: textLayer
                        };

                        var renderTask = page.render(renderContext); //.then(AddAnnotations);
                        // Wait for rendering to finish
                        renderTask
                            .then(function () {

                                $scope.PDFDOC.pageRendering = false;

                                if ($scope.PDFDOC.pageNumPending !== null) {
                                    // New page rendering is pending
                                    renderPage($scope.PDFDOC.pageNumPending);
                                    $scope.PDFDOC.pageNumPending = null;
                                }
                                UtilsService.hideProgressBar('new_ci_modal_progress');


                                //setupAnnotations();

                                //william: re-active 'zoom' button.
                                $scope.$broadcast('zoom-processing', 'done');

                                //this is to set jScroll for PDFWrapper
                                Set_PDF_jScroll();
                            });
                    });
            });
    }

    //START: SCROLLING
    $scope.scroll_added = false;
    $scope.scrollAPI = null;
    function Set_PDF_jScroll() {
        if ($scope.scroll_added) {
            if ($scope.scrollAPI) {
                setTimeout(function () {
                    $scope.scrollAPI.reinitialise();
                }, 5);
            }
        } else {
            var settings = {
                verticalGutter: 0,
                horizontalGutter: 0,
                autoReinitialise: false,
                autoReinitialiseDelay: 100
            };

            var pane = $jQL('#pdfWrapper');
            pane.jScrollPane(settings);
            $scope.scrollAPI = pane.data('jsp');

            $scope.scroll_added = true;
        }
    }

    //END: SCROLLING

    /**
     * this is to queue the rendering of pdf document
     * @param num
     */
    function queueRenderPage(num) {
        if ($scope.PDFDOC.pageRendering) {
            $scope.PDFDOC.pageNumPending = num;
        }
        else {
            renderPage(num);
        }
    }

    $scope.renderPage = renderPage.bind($scope);

    /**
     * this is to load the previous page of PDF
     */
    $scope.onPrevPage = function () {
        if (!_.isNumber($scope.PDFDOC.pageNum)) {
            return;
        }
        if ($scope.PDFDOC.pageNum <= 1) {
            return;
        }
        $scope.PDFDOC.pageNum--;
        queueRenderPage($scope.PDFDOC.pageNum);
    };
    /**
     * this is to load the next page of PDF
     */
    $scope.onNextPage = function () {
        if (!_.isNumber($scope.PDFDOC.pageNum)) {
            return;
        }
        if ($scope.PDFDOC.pageNum >= $scope.PDFDOC.pageCount) {
            return;
        }
        $scope.PDFDOC.pageNum++;
        queueRenderPage($scope.PDFDOC.pageNum);
    };
    /**
     * this is to load the first page of PDF
     */
    $scope.onFirstPage = function () {
        if (!_.isNumber($scope.PDFDOC.pageNum)) {
            return;
        }
        if ($scope.PDFDOC.pageNum <= 1) {
            return;
        }
        $scope.PDFDOC.pageNum = 1;
        queueRenderPage($scope.PDFDOC.pageNum);
    };
    /**
     * this is to load the last page of PDF
     */
    $scope.onLastPage = function () {
        if (!_.isNumber($scope.PDFDOC.pageNum)) {
            return;
        }
        if ($scope.PDFDOC.pageNum >= $scope.PDFDOC.pageCount) {
            return;
        }
        $scope.PDFDOC.pageNum = $scope.PDFDOC.pageCount;
        queueRenderPage($scope.PDFDOC.pageNum);
    };
    /**
     * this is to load the page entered in the current page textbox
     * @param $event
     * @constructor
     */
    $scope.gotoPage = function ($event) {
        //we are here means the current page value is changed in the UI
        if (_.isNumber($scope.PDFDOC.pageNum)) {
            if (!UtilsService.inRange($scope.PDFDOC.pageNum, 1, $scope.PDFDOC.pageCount)) {
                $scope.PDFDOC.pageNum = $scope.PDFDOC.pageCount;
            }
        } else {
            //don't render if not a number
            return;
        }

        queueRenderPage($scope.PDFDOC.pageNum);

    };

    //</editor-fold>
}

angular.module('trafficbridge.cc').
    controller('NewCICtrl', [
        '$scope',
        '$rootScope',
        '$modal',
        '$modalInstance',
        '$routeParams',
        '$location',
        '$log',
        'DataService',
        'NotifierService',
        'UtilsService',
        'mvIdentity',
        'ciId',
        'ci',
        'metadata',
        'APP_CONFIG',
        NewCICtrl
    ]);
