/**
 * Created by PavaniKa on 4/14/2015.
 */

function PossibleRevisionCICtrl($scope,
                                $modalInstance,
                                $routeParams,
                                $location,
                                $log,
                                $http,
                                DataService,
                                NotifierService,
                                UtilsService,
                                mvIdentity,
                                APP_CONFIG,
                                ciId,
                                ci,
                                revised_candidates) {

    "use strict";

    $scope.$on('$includeContentLoaded', function (event, url, c, d) {
        $scope.adjustDivHeights();
    });

    $scope.adjustDivHeights = function () {
        if (TPVTB.AddPossibleRevisionsBehaviors && _.isFunction(TPVTB.AddPossibleRevisionsBehaviors)) {
            //this is defined in home.js from Agility!
            TPVTB.AddPossibleRevisionsBehaviors();
        }
    };

    $scope.ci = ci;
    $scope.IS_COMPARE_SCREEN = true; //this is used in pdf rotation
    $scope.selectedCI = ci; //this is possible revision, ONLY ONE at a time.
    $scope.candidate_cis = []; //these are possibly revised, multiple at a time.

    //Get the original version based on 'possible_revision' flag
    _.find(revised_candidates, function (revision) {
        //TODO: remove this check!
        //if (revision.possible_revision === false && revision.possibly_revised === true) {
        if (revision.possibly_revised === true) {
            $scope.candidate_cis.push(revision);
        }
        //we won't get this CI
        /* else {
         $scope.ci = revision;
         $scope.selectedCI = revision;
         }*/
    });


    $scope.selectedCandidateCI = $scope.candidate_cis.length > 0 ? $scope.candidate_cis[0] : null;
    $scope.pageHostName = $location.$$protocol + '://' + $location.$$host + ":" + $location.$$port + '/';

    $scope.match = {};

    $scope.revisionOption = {
        staple: null,
        option: null,
        reason: ''
    };

    $scope.matchedRevisionOptions = [];

    _.forEach(revised_candidates, function (ci) {
        $scope.match[ci._id] = false;
    });

    //Define PDF related variables, these are used in pdf-view directive.
    $scope.PDFDOC = {
        Right: {
            URL: '',
            pdfDoc: null,
            pageNum: 1,
            pageCount: 1,
            pageRendering: false,
            pageNumPending: null,
            hasEmail: false,
            emailURL: '',
            isPossibleCandidate: true
        },
        Left: {
            URL: '',
            pdfDoc: null,
            pageNum: 1,
            pageCount: 1,
            pageRendering: false,
            pageNumPending: null,
            hasEmail: false,
            emailURL: ''
        }
    };

    //get the staples of candidates
    $scope.currentCandidateStaples = [];
    $scope.selectedCandidateStaple = null;

    function Get_Candidate_Staples(ciId) {
        return DataService.CI
            .getStapledCIs(ciId)
            .then(function (cis) {
                return cis;
            });
    }

    function Reset_Candidate_Staples() {
        $scope.currentCandidateStaples = [];
        $scope.selectedCandidateStaple = null;
    }
    /**
     * RULES
     * Right side - possibly revised candidate(s)
     * Left side - possible revision - ONLY ONE at a time
     */
        //RIGHT SIDE PDF Variables
    Set_Candidate_CI_PDF_Variables();

    //LEFT SIDE PDF Variables
    Set_Revision_CI_PDF_Variables();

    function Set_Candidate_CI_PDF_Variables() {
        if (!$scope.selectedCandidateCI) {
            console.log('$$$$$ Candidate CI is missing!');
            return;
        }

        //this is a stapled bundle, get the staples
        if ($scope.selectedCandidateCI.staple.length > 0) {
            //staples information not available yet, so get it! //TODO: this needs to be cached.
            if($scope.currentCandidateStaples.length == 0) {
                Get_Candidate_Staples($scope.selectedCandidateCI._id)
                    .then(function(cis) {
                        $scope.currentCandidateStaples = cis;
                        if(cis.length > 0) {

                            //console.dir(cis);
                            //select the first revision by default
                            $scope.selectedCandidateStaple = cis[0];
                            Set_Candidate_CI_PDF_Variables();

                        } else {
                            console.log('staples information missing for CI: ' + $scope.selectedCandidateCI._id);
                        }
                    });
            } else if($scope.selectedCandidateStaple) {

                $scope.PDFDOC.Right.showViewSelectButton = ($scope.selectedCandidateStaple.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
                $scope.selectedCandidateStaple.ingest.files.original &&
                $scope.selectedCandidateStaple.ingest.files.email);

                $scope.PDFDOC.Right.URL = $scope.selectedCandidateStaple.ingest.files.common ? $scope.selectedCandidateStaple.ingest.files.common.url : null;
                $scope.PDFDOC.Right.hasEmail = ($scope.selectedCandidateStaple.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
                $scope.selectedCandidateStaple.ingest.files.email);
                $scope.PDFDOC.Right.bShowEmail = ($scope.selectedCandidateStaple.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
                !$scope.selectedCandidateStaple.ingest.files.original);
                $scope.PDFDOC.Right.emailURL = $scope.PDFDOC.Right.hasEmail ? $scope.selectedCandidateStaple.ingest.files.email.url : '';

                //broadcast to load this new version ci's pdf
                $scope.$broadcast('revision-clicked', 'staple');

            } else {
                console.log('selected candidate have no staples, CI: ' + $scope.selectedCandidateCI._id);
            }

        } else {

            $scope.PDFDOC.Right.showViewSelectButton = ($scope.selectedCandidateCI.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
            $scope.selectedCandidateCI.ingest.files.original &&
            $scope.selectedCandidateCI.ingest.files.email);

            $scope.PDFDOC.Right.URL = $scope.selectedCandidateCI.ingest.files.common ? $scope.selectedCandidateCI.ingest.files.common.url : null;
            $scope.PDFDOC.Right.hasEmail = ($scope.selectedCandidateCI.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
            $scope.selectedCandidateCI.ingest.files.email);
            $scope.PDFDOC.Right.bShowEmail = ($scope.selectedCandidateCI.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
            !$scope.selectedCandidateCI.ingest.files.original);
            $scope.PDFDOC.Right.emailURL = $scope.PDFDOC.Right.hasEmail ? $scope.selectedCandidateCI.ingest.files.email.url : '';

            //broadcast to load this new version ci's pdf
            $scope.$broadcast('revision-clicked', 'revision');
        }
    }

    function Set_Revision_CI_PDF_Variables() {
        if(!$scope.selectedCI) {
            console.log('##### Possible revision CI is missing!');
            return;
        }

        $scope.PDFDOC.Left.showViewSelectButton = ($scope.selectedCI.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
        $scope.selectedCI.ingest.files.original &&
        $scope.selectedCI.ingest.files.email);

        $scope.PDFDOC.Left.URL = $scope.selectedCI.ingest.files.common ? $scope.selectedCI.ingest.files.common.url : null;
        $scope.PDFDOC.Left.hasEmail = ($scope.selectedCI.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
        $scope.selectedCI.ingest.files.email);
        $scope.PDFDOC.Left.bShowEmail = ($scope.selectedCI.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
        !$scope.selectedCI.ingest.files.original);
        $scope.PDFDOC.Left.emailURL = $scope.PDFDOC.Left.hasEmail ? $scope.selectedCI.ingest.files.email.url : '';
    }

    //<editor-fold desc="Modal Button Events">
    $scope.modalInstance = $modalInstance;
    /**
     * this is to close the modal
     */
    $scope.ok = function () {

        $modalInstance.close($scope.CI_UPDATED_FLAG);
    };
    /**
     * this is to dismiss the modal
     */
    $scope.cancel = function () {

        $modalInstance.dismiss('cancel');
    };

    $scope.CI_UPDATED_FLAG = false;
    //</editor-fold>

    /**
     * this is to set the current revision option of a possible revision to a default state.
     * @constructor
     */
    function Set_Current_Revision_Option() {
        //Check if there is a decision already made for this revision
        var _revisionOpt = _.find($scope.matchedRevisionOptions, function (match) {
            return match.candidateCIId === $scope.selectedCandidateCI._id;
        });

        if (_revisionOpt) {
            $scope.revisionOption = _revisionOpt.revisionOption;
            //console.log('Current revisionOption: ' + $scope.revisionOption);
            //console.dir($scope.revisionOption);
        } else {
            //reset to default
            $scope.revisionOption = {
                staple: null,
                option: null,
                reason: ''
            };
        }
    }

    /**
     * this is to update the matched revision decisions for a revision.
     */
    function setMatchedRevisionOptions() {
        //remove any prevision decision made on this option
        _.remove($scope.matchedRevisionOptions, function (match) {
            return match.candidateCIId === $scope.selectedCandidateCI._id;
        });

        //add the new options
        $scope.matchedRevisionOptions.push({
            candidateCIId: $scope.selectedCandidateCI._id,
            revisionCIId: $scope.selectedCI._id,
            revisionOption: $scope.revisionOption,
            //these are for stapled bundles
            isCandidateBundle: $scope.selectedCandidateStaple != null,
            candidateBundleIds: _.pluck($scope.currentCandidateStaples, '_id'),
            candidateRevisionFlag: $scope.selectedCandidateCI.pending_revision //this is used in backend to determine if the new staple will have the 'pending_revision' flag set to TRUE.
        });

        //console.clear();
        //console.dir($scope.matchedRevisionOptions);
        $scope.isDecisionMadeForAll();
    }

    /**
     * this is to set the matched revision option when one of the 3 radio buttons is selected.
     * @param $event
     * @param radioType
     */
    $scope.onRadioOptionSelect = function ($event, radioType) {


        if (radioType === 'NO') {
            $scope.revisionOption.staple = 'NO';
            //set match.option to null
            $scope.revisionOption.option = null;
        } else {
            $scope.revisionOption.staple = 'YES';
            //set reason false
            $scope.revisionOption.reason = '';
        }

        //console.log('onRadioOptionSelect: ' + radioType + ', ' + $scope.revisionOption.match.option);
        setMatchedRevisionOptions();
    };
    /**
     * this is to set the matched revision option's reason text entered.
     * @param $event
     */
    $scope.onReasonChange = function ($event) {
        //console.log('onReasonChange: ' + $scope.revisionOption.reason);
        setMatchedRevisionOptions();
    };
    /**
     * this is to clear the previous decision made on a possible revision.
     * @param $event
     * @param value
     */
    /*$scope.onRadioOptionYesNoSelect = function ($event, value) {
     //console.log('onRadioOptionYesNoSelect: ' + value);
     $scope.revisionOption.staple = value;
     if (value === 'YES') {
     //set reason false
     $scope.revisionOption.reason = '';
     } else {
     //set match.option to null
     $scope.revisionOption.option = null;
     }
     };*/
    /**
     * this will open the compare PDF in a new browser window.
     * @param $event
     */

    $scope.bOnSCC = false;
    $scope.onSystemCompareClick = function ($event) {
        //console.dir($scope.matchedRevisionOptions);
        //return;

        if ($scope.bOnSCC) {
            return;
        }
        $scope.bOnSCC = true;

        var compareData = {
            doc1: $scope.selectedCI.ingest.files.common.url,
            doc2: $scope.selectedCandidateCI.ingest.files.common.url
        };

        if (!$scope.compare_urls) {
            $scope.compare_urls = [];
        }

        $scope.compare_urls[0] = $scope.selectedCI.ingest.files.common.url;
        $scope.compare_urls[1] = $scope.selectedCandidateCI.ingest.files.common.url;

        $http.post('/api/comparePDF',$scope.compare_urls)
            .then(function(response) {

                $scope.bOnSCC = false;

                var docLocation;

                if (response.data.status >= 400) {

                    NotifierService.notifyError('An error occurred while attempting to compare your documents');//response.data.statusCode + ' ' + response.data.body );
                    return;
                }

                var ciCompareUrl = response.data.url;

                window.open(ciCompareUrl,'resizeable,scrollbar');

                /*   Uncomment to have the compare as a popup instead of a tab.
                 // $scope.cancel();  // close existing popup
                 var leftPos = (screen.width * .05) | 0;
                 var topPos = (screen.height * .05) | 0;
                 var width = (screen.width * .90) | 0;
                 var height = (screen.height * .80) | 0;
                 var ref = window.open(docLocation, 'thePop'
                 , 'height=' + height + ',width=' + width + ',left=' + leftPos + ',top=' + topPos + ',scrollbars=no'); //menubar=1,resizable=1,status=1
                 ref.focus();
                 */

                $scope.bCompareOpen = true;
                $scope.comparedCIToDisplay = docLocation;
            });
    };

    /**
     * this is to save the decisions made for each possible revsion CI (left side).
     */

    $scope.onSaveRevisionsClick = function () {
        //console.log('Saving...');
        DataService.CI
            .stapleRevisions($scope.ci._id, $scope.matchedRevisionOptions)
            .then(function (stapledCI) {
                //console.log('success!');
                //console.dir(stapledCI);
                $scope.CI_UPDATED_FLAG = true;
                $scope.ok();
                //$scope.cancel();
            }, function (error) {
                //console.log('Error: ' + error);
                $scope.continueButtonClicked = false;
                NotifierService.notifyError(error.data.reason);

            });
    };

    //$scope.showRadioButtons = true;
    //$scope.showActionButtons = false;
    //$scope.stapledRevisionCount = 0;
    /**
     * this is to check if a decision is made on all possible revisions.
     * @returns {boolean|number}
     */
    $scope.isDecisionMadeForAll = function () {
        /**
         * once we are reviewing we will go back to the action buttons only when we reach
         * the last possible revision on the UI.
         */

        //1. stapledRevisionCount
        /*var _revisionCount = _.filter($scope.matchedRevisionOptions, function (decision) {
         return decision.revisionOption.staple === 'YES';
         });
         $scope.stapledRevisionCount = _revisionCount.length;*/

        //2. decision check
        /*var bFlag = ($scope.matchedRevisionOptions.length === $scope.candidate_cis.length)
         && (_.lastIndexOf($scope.candidate_cis, $scope.selectedCandidateCI) === ($scope.candidate_cis.length - 1));*/

        //how many decisions are made
        var bFlag1 = $scope.matchedRevisionOptions.length === $scope.candidate_cis.length;

        //how many NO's are without a reason
        var bFlag2 = _.filter($scope.matchedRevisionOptions, function(option) {
                return option.revisionOption.staple === 'NO' && option.revisionOption.reason === '';
            }).length === 0;

        //$scope.showRadioButtons = !bFlag;
        //$scope.showActionButtons = bFlag;

        return bFlag1 && bFlag2;
    };

    $scope.isDecisionMadeForRevision = function(_revisionId) {
        return _.filter($scope.matchedRevisionOptions, function(option) {
                return option.candidateCIId === _revisionId;
            }).length > 0;
    };
    /**
     * this is to load the revision candidate which is clicked
     * @param ciId
     */
    $scope.onRevisionClick = function (ciId) {
        //set current revision for the array
        $scope.selectedCandidateCI = _.find($scope.candidate_cis, function (ci) {
            return ci._id === ciId;
        });
        //reset the radio options
        Set_Current_Revision_Option();
        //reset the candidate staples
        Reset_Candidate_Staples();
        //set the PDF variables
        Set_Candidate_CI_PDF_Variables();
        //broadcast to load this new candidate ci's pdf
        //$scope.$broadcast('revision-clicked', 'revision');
        //this is to adjust the pdf & email div heights, needed for loading CIs without pdf.
        $scope.adjustDivHeights();
    };
    /**
     * this is to load the previous possible revision if any.
     * @param $event
     */
    $scope.onPreviousClick = function ($event) {
        var curIndex = _.lastIndexOf($scope.candidate_cis, $scope.selectedCandidateCI);
        var prevIndex = curIndex - 1;

        if (curIndex >= 0 && prevIndex >= 0 && prevIndex < $scope.candidate_cis.length) {
            //console.log('Previous of ' + curIndex + ' is ' + prevIndex);

            $scope.selectedCandidateCI = $scope.candidate_cis[prevIndex];
            //reset the radio options
            Set_Current_Revision_Option();
            //reset the candidate staples
            Reset_Candidate_Staples();
            //set the PDF variables
            //Set_Revision_CI_PDF_Variables();
            Set_Candidate_CI_PDF_Variables();
            //broadcast to load this new revision ci's pdf
            //$scope.$broadcast('revision-clicked', 'revision');
            //this is to adjust the pdf & email div heights, needed for loading CIs without pdf.
            $scope.adjustDivHeights();
        }
    };
    /**
     * this is to load the next possible revision if any.
     * @param $event
     */
    $scope.onNextClick = function ($event) {
        var curIndex = _.lastIndexOf($scope.candidate_cis, $scope.selectedCandidateCI);
        var nextIndex = curIndex + 1;

        if (curIndex >= 0 && nextIndex >= 0 && nextIndex < $scope.candidate_cis.length) {
            //console.log('Next of ' + curIndex + ' is ' + nextIndex);

            $scope.selectedCandidateCI = $scope.candidate_cis[nextIndex];
            //reset the radio options
            Set_Current_Revision_Option();
            //reset the candidate staples
            Reset_Candidate_Staples();
            //set the PDF variables
            //Set_Revision_CI_PDF_Variables();
            Set_Candidate_CI_PDF_Variables();
            //broadcast to load this new revision ci's pdf
            //$scope.$broadcast('revision-clicked', 'revision');
            //this is to adjust the pdf & email div heights, needed for loading CIs without pdf.
            $scope.adjustDivHeights();
        }

    };
    /**
     * this is to load the first possible revision along
     * with the decision made on it.
     */
    $scope.gotoFirstPossibleRevision = function () {
        $scope.selectedCandidateCI = $scope.candidate_cis[0];
        //reset the radio options
        Set_Current_Revision_Option();
        //reset the candidate staples
        Reset_Candidate_Staples();
        //set the PDF variables
        //Set_Revision_CI_PDF_Variables();
        Set_Candidate_CI_PDF_Variables();
        //broadcast to load this new revision ci's pdf
        //$scope.$broadcast('revision-clicked', 'revision');
        //this is to adjust the pdf & email div heights, needed for loading CIs without pdf.
        $scope.adjustDivHeights();
    };
    /**
     * this is to review all decisions made on all
     * possible revisions before saving to database
     * @param $event
     */
    $scope.onReviewClick = function ($event) {
        $scope.showRadioButtons = true;
        $scope.showActionButtons = false;

        $scope.gotoFirstPossibleRevision();
    };
    /**
     * this is to save all decisions made on all
     * possible revisions to database.
     * @param $event
     */
    $scope.continueButtonClicked = false;
    $scope.onContinueClick = function ($event) {
        //prevent double clicks!
        $scope.continueButtonClicked = true;
        $scope.onSaveRevisionsClick();
    };

    $scope.onCandidateStapleClick = function ($event, _ci) {

        $scope.selectedCandidateStaple = _.first(_.filter($scope.currentCandidateStaples, function (ci) {
            return ci._id === _ci._id;
        }));

        //Load this version CI
        Set_Candidate_CI_PDF_Variables();
        //broadcast to load this new revision ci's pdf
        //$scope.$broadcast('revision-clicked', 'staple');
    };

    $scope.onChangeRotation = function(newRotation,ci,notify) {
        var _ci;
        var _notify = false;
        if (ci) _ci = ci;
        else _ci = $scope.ci;
        if (notify) _notify = notify;

        console.log('Id: ' + _ci._id + ', rotation: ' + newRotation);
        DataService.CI
            .setRotation(_ci._id, newRotation)
            .then(function () {
                if(_notify) NotifierService.notifySuccess('CI ' + _ci._id + ' rotation set to ' + newRotation );
            })
            .catch(function () {
                NotifierService.notifyError('Failed to set CI ' + _ci._id + ' rotation to ' + newRotation);
            });
    };

}
angular.module('trafficbridge.cc').
    controller('PossibleRevisionCICtrl', [
        '$scope',
        '$modalInstance',
        '$routeParams',
        '$location',
        '$log',
        '$http',
        'DataService',
        'NotifierService',
        'UtilsService',
        'mvIdentity',
        'APP_CONFIG',
        'ciId',
        'ci',
        'revised_candidates',
        //'possible_revision_staples',
        PossibleRevisionCICtrl]);
