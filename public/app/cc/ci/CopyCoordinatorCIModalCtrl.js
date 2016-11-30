/**
 * Created by PavaniKa on 3/18/2015.
 */

function CopyCoordinatorCIModalCtrl($scope,
                                    $location,
                                    $routeParams,
                                    $timeout,
                                    $modalInstance,
                                    $modal,
                                    $q,
                                    $log,
                                    $http,
                                    mvIdentity,
                                    DataService,
                                    NotifierService,
                                    UtilsService,
                                    ciId,
                                    ci,
                                    stapled_cis,
                                    parkinglot,
                                    users,
                                    APP_CONFIG,
                                    Restangular) {

    //Modal OK, CLOSE buttons
    $scope.ok = function () {
        $modalInstance.close($scope.CI_UPDATED_FLAG);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss($scope.CI_UPDATED_FLAG);
        /*if ($scope.originalRotation  != $scope.rotate){
          $scope.onChangeRotation($scope.rotate);
          }*/
    };

    $scope.CI_UPDATED_FLAG = false;

    //on content loaded:
    $scope.$on('$includeContentLoaded', function (event, url) {
        //$log.debug('CI Modal $includeContentLoaded');
        setScreenSizesLoadCI();
    });

    function setScreenSizesLoadCI() {
        //this is to add toggle behaviors to versions & annotations panels
        if (TPVTB.AddCIDetailsToggleBehaviors && _.isFunction(TPVTB.AddCIDetailsToggleBehaviors)) {
            //this is defined in main.js from Agility!
            TPVTB.AddCIDetailsToggleBehaviors();
        }

        //this is the initial load
        $scope.loadCI();
    }

    $scope.ci = ci;
    $scope.IS_CI_DETAILS_SCREEN = true; //this is used in pdf rotation
    $scope.originalRotation = $scope.ci.rotation;
    $scope.stapled_cis = stapled_cis;
    $scope.activeRevisionsOnly = false;
    $scope.displayed_stapled_cis = stapled_cis; // What is displayed is dependent on whether Active Only is set
    $scope.active_ci = _.first($scope.displayed_stapled_cis) || $scope.ci;

    $scope.parkinglot = parkinglot;
    $scope.isInParkingLot = $scope.parkinglot && _.contains($scope.parkinglot.cis, $scope.ci._id);
    $scope.editNoteMode = false;

    $scope.users = users;
    $scope.currentUser = {
        'userName': mvIdentity.currentUser.userName,
        'firstName': mvIdentity.currentUser.firstName,
        'lastName': mvIdentity.currentUser.lastName,
        'fullName': UtilsService.getFullNameOfUser(mvIdentity.currentUser)
    };
    $scope.currentOwner = _.find($scope.users, function (_user) {
        return _user.userName === $scope.ci.owner;
    });

    // this is determined in Load_CI method
    // $scope.hasEmail = $scope.ci.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL;

    // <editor-fold desc="Status Drop down">
    $scope.statuses = _.map(_.keys(APP_CONFIG.CI.STATUS), function (key, index) {
        return {name: UtilsService.getNameFromKey(key), value: APP_CONFIG.CI.STATUS[key]};
    });
    //only show In Progress, Completed & Ignored in the drop down
    _.remove($scope.statuses, function (status) {
        return (status.value != APP_CONFIG.CI.STATUS.IN_PROGRESS &&
                status.value != APP_CONFIG.CI.STATUS.COMPLETED &&
                status.value != APP_CONFIG.CI.STATUS.IGNORED);
    });

    var selectedStatus = -1;
    selectedStatus = _.find($scope.statuses, function (status) {
        return status.value == $scope.ci.status;
    });
    $scope.selectedStatus = selectedStatus;

    $scope.onChangeStatus = function (newStatus) {

        //if same status is selected then no need to update
        if (newStatus.value === $scope.ci.status) {
            return;
        }

        //update the status
        $scope.selectedStatus = newStatus;
        var status = $scope.selectedStatus;
        DataService.CI
            .setStatus($scope.ci._id, status.value)
            .then(function () {
                NotifierService.notifySuccess('CI ' + $scope.ci._id + ' status set to ' + status.name + '.');
            })
            .catch(function () {
                NotifierService.notifyError('Failed to set CI ' + $scope.ci._id + ' status to ' + status.name + '.');
            });
    };

    $scope.onChangeRotation = function (newRotation, ci, notify) {

        var _ci;
        var _notify = false;

        if (ci) {
            _ci = ci;
        }
        else {
            _ci = $scope.ci;
        }

        if (notify) {
            _notify = notify;
        }

        DataService.CI
            .setRotation(_ci._id, newRotation)
            .then(function () {

                if (_notify) {
                    NotifierService.notifySuccess('CI ' + _ci._id + ' rotation set to ' + newRotation);
                }
            })
            .catch(function () {

                NotifierService.notifyError('Failed to set CI ' + _ci._id + ' rotation to ' + newRotation);
            });
    };

    $scope.onChangeOwner = function (newOwner) {

        $scope.currentOwner = newOwner;
        $scope.ci.owner = newOwner.userName;
        $scope.ci.owner_id = newOwner._id;

        DataService.CI
            .updateOwner($scope.ci._id, newOwner)
            .then(function () {
                NotifierService.notifySuccess('Owner is updated to ' + $scope.ci.owner + ' for CI ' + $scope.ci._id + '.');
            })
            .catch(function () {
                NotifierService.notifyError('Failed to update owner to ' + $scope.ci.owner + ' for CI ' + $scope.ci._id + '.');
            });
    };

    function prepareActionsDropDown() {

        var actionItems;

        if ($scope.active_ci.active) {

            actionItems = [
                {
                    label: 'Mark Inactive',
                    fn: function () {
                        $scope.markInactive();
                    }
                }
            ];
        }
        else {

            actionItems = [
                {
                    label: 'Mark Active',
                    fn: function () {
                        $scope.markActive();
                    }
                }
            ];
        }

        if ($scope.stapled_cis.length > 0) {
            actionItems.push({
                label: 'Unstaple this version',
                fn: function () {
                    $scope.unstapleVersion();
                }
            });
        }

        actionItems.push({
            label: 'Print CI',
            fn: function () {
                $scope.printCI();
            }
        });

        $scope.actionItems = actionItems;
    }

    $scope.markActive = function () {
        $scope.setActive(true);
    };

    $scope.markInactive = function () {
        $scope.setActive(false);
    };

    $scope.setActive = function (active) {

        DataService
            .CI
            .setActive($scope.active_ci._id, active)
            .then(function (_ci) {

                $scope.active_ci.active = active;
                prepareActionsDropDown();

                NotifierService.notifySuccess('CI ' + $scope.active_ci._id + ' active status set to ' + active + '.');
            })
            .catch(function () {

                NotifierService.notifyError('Failed to set CI ' + $scope.active_ci._id + ' active status to ' + active + '.');
            });
    };

    $scope.printCI = function() {

        var url =  $scope.active_ci.ingest.files.common.url;
        var type = $scope.active_ci.ingest.files.common.file_type  ; // "application/pdf"
        var urltype = '';
        if (type == 'application/pdf' && url.toLowerCase().indexOf('.pdf') < 0 ) {
            urltype = '.pdf';
        }
        // alert("Printing CI "+ $scope.ci.advertiser + " " + $scope.ci.air_date_start + " " + url);

        if (url) {
            window.open(url);
        }
    };

    //========

    $scope.serverPrintCI = function (url) {
        $http.post('/api/ciPrint', url)
            .then(function (response) {
                /*
                  $scope.bOnSCC = false;
                  var docLocation;
                  if (response && response.data && response.data.body) {

                  }
                  else if (response && response.data) {
                  NotifierService.notifyError(response.data);
                  return;
                  }
                  else {
                  //if (response && response.indexOf("connect") > -1) {
                  //    alert(response);
                  //}
                  //else
                  NotifierService.notifyError("Error in compare");
                  return;
                  }
                  var reply = JSON.parse(response.data.body)
                  if (reply && reply.filename == "" && reply.error.length > 0) {
                  NotifierService.notifyError(reply.error);
                  return;
                  }
                  var filename = JSON.parse(response.data.body).filename;
                  if (_.startsWith(filename, "error")) {
                  NotifierService.notifyError(response.data.body);
                  // console.log(" reply from compare ");
                  // alert(response.data);
                  }

                  else {
                  // alert(docLocation);
                  // var docLocation = 'http://localhost:3001/compare/attachments/diff/PDFC_differences_Universalmccann_ZENITHMEDIA.pdf';
                  docLocation = 'http://localhost:3001/compare/attachments/diff/' + filename;
                  if (dispType == 'tab') {
                  window.open(docLocation, "resizeable,scrollbar");
                  }

                  // $scope.cancel();  // close existing popup
                  var leftPos = (screen.width * .05) | 0;
                  var topPos = (screen.height * .05) | 0;
                  var width = (screen.width * .90) | 0;
                  var height = (screen.height * .80) | 0;

                  if (dispType == 'popup') {
                  var ref = window.open(docLocation, "thePop"
                  , "height=" + height + ",width=" + width + ",left=" + leftPos + ",top=" + topPos + ",scrollbars=no"); //menubar=1,resizable=1,status=1
                  ref.focus();
                  }
                  }
                  $scope.bCompareOpen = true;
                  /// $scope.comparedCIToDisplay = "/attachments/PDFC_differences_NBC_Blacklist_3.31-4.27_unc_R1_cancel_unc.pdf";
                  $scope.comparedCIToDisplay = docLocation;
                */
            });
    };

    //========

    $scope.unstapleVersion = function () {

        var sourceId = $scope.ci._id;
        var sourceStatus = $scope.ci.pending_revision;
        var targetId = $scope.active_ci._id;

        console.log('Unstaple ' + targetId + ' from ' + sourceId);

        var unstapleReasonModalInstance = $modal.open({
            templateUrl: 'UNSTAPLE_REASON_MODAL',
            controller: 'UnstapleReasonCtrl',
            windowClass: 'save-search', //because this modal is copied from save search modal!
            backdrop: 'static',
            resolve: {
                payload: function () {
                    return {
                        sourceId: sourceId,
                        sourceStatus: sourceStatus,
                        targetId: targetId
                    };
                }
            }
        });

        unstapleReasonModalInstance.result.then(function (data) {

            $log.debug('Unstaple Reason Modal closed at: ' + moment().format('h:mm:ss a') + ', Reason: ' + data);
            //after unstapling, refresh the whole CI, to reflect the DB changes.

            $scope.ci = data.newCI;
            $scope.active_ci = $scope.ci;

            var ciId = $scope.ci._id;
            var promises = [
                DataService.CI.getStapledCIs(ciId),
                DataService.CI.getParkingLot()
            ];

            $q.all(promises)
                .then(function (data) {
                    //stapled CIs
                    $scope.stapled_cis = data[0];
                    $scope.activeRevisionsOnly = false;
                    $scope.displayed_stapled_cis = data[0]; // What is displayed is dependent on whether Active Only is set
                    $scope.active_ci = _.first($scope.displayed_stapled_cis) || $scope.ci;

                    //parking lot
                    $scope.parkinglot = data[1];
                    $scope.isInParkingLot = $scope.parkinglot && _.contains($scope.parkinglot.cis, $scope.ci._id);
                    $scope.editNoteMode = false;
                    //reset the screen and reload the new active CI
                    setTimeout(function () {
                        $scope.scale = 999;
                        setScreenSizesLoadCI();
                    }, 10);
                })
                .catch(function (e) {
                    return e.toString();
                });

        }, function (reason) {

            $log.debug('Unstaple Reason Modal dismissed at: ' + moment().format('h:mm:ss a'));

        });

    };
    // </editor-fold>

    // <editor-fold desc="Buttons & Links Events">
    $scope.addCIToParkingLot = function () {

        DataService
            .CI
            .addToParkingLot($scope.ci._id)
            .then(function (obj) {
                updateParkingLot();
                NotifierService.notifySuccess('Added CI to Parking Lot.');
            })
            .catch(function (err) {
                updateParkingLot();
                NotifierService.notifyError('Failed to add CI to Parking Lot.');
            });
    };

    $scope.removeCIFromParkingLot = function () {

        DataService
            .CI
            .removeFromParkingLot($scope.ci._id)
            .then(function (obj) {
                updateParkingLot();
                NotifierService.notifySuccess('Removed CI from Parking Lot.');
            })
            .catch(function (err) {
                updateParkingLot();
                NotifierService.notifyError('Failed to remove CI from Parking Lot.');
            });
    };

    function updateParkingLot() {

        DataService
            .CI
            .getParkingLot()
            .then(function (parkingLot) {
                $scope.parkinglot = parkingLot;
                $scope.isInParkingLot = $scope.parkinglot && _.contains($scope.parkinglot.cis, $scope.ci._id);
            })
            .catch(function (err) {
            });
    }

    $scope.onClickViewHistory = function () {
        $scope.cancel('history opened');
        $location.path('/cc/history/' + $scope.ci._id);
    };

    $scope.clearRevision = function () {

        //$scope.ci.pending_revision = false;

        DataService
            .CI
            .clearPendingRevisionFlag($scope.ci._id)
            .then(function (_ci) {

                $scope.ci = angular.isArray(_ci) ? _ci[0] : _ci;
                NotifierService.notifySuccess('Uncleared revision flag is cleared for CI (' + $scope.active_ci._id + ').');
            })
            .catch(function (error) {

                NotifierService.notifyError('Failed to clear uncleared revision flag for CI (' + $scope.active_ci._id + ').');
            });
    };

    $scope.clearUninstructedMatch = function () {

        //$scope.ci.uninstructed_match = false;

        DataService
            .CI
            .clearUninstructedMatchFlag($scope.ci._id)
            .then(function (_ci) {

                $scope.ci = angular.isArray(_ci) ? _ci[0] : _ci;
                NotifierService.notifySuccess('Uninstructed match flag is cleared for CI (' + $scope.active_ci._id + ').');
            })
            .catch(function (error) {

                NotifierService.notifyError('Failed to clear uninstructed match flag for CI (' + $scope.active_ci._id + ').');
            });
    };

    $scope.clearStuck = function () {

        //$scope.ci.stuck = false;

        DataService
            .CI
            .clearStuckFlag($scope.ci._id)
            .then(function (_ci) {

                $scope.ci = angular.isArray(_ci) ? _ci[0] : _ci;
                NotifierService.notifySuccess('Stuck flag is cleared for CI (' + $scope.active_ci._id + ').');
            })
            .catch(function (error) {

                NotifierService.notifyError('Failed to clear stuck match flag for CI (' + $scope.active_ci._id + ').');
            });
    };

    /**
     * this is to show only active revisions in the revisions panel
     * @param $event
     * @param activeFlag
     */
    $scope.onClickActiveOnly = function ($event, activeFlag) {

        $scope.activeRevisionsOnly = activeFlag;

        if ($scope.activeRevisionsOnly) {

            $scope.displayed_stapled_cis = _.filter($scope.stapled_cis, function (ci) {
                return ci.active;
            });

            //see if currently active ci is part of the active revisions
            //otherwise select the first active ci
            if (_.findIndex($scope.displayed_stapled_cis, function (ci) {
                return ci._id === $scope.active_ci._id;
            }) < 0) {
                $scope.active_ci = $scope.displayed_stapled_cis[0];
                $scope.loadCI();
            }
        }
        else {
            $scope.displayed_stapled_cis = $scope.stapled_cis;
        }
    };

    /**
     * this is fired when a particular revision is clicked in the revisions list
     * @param $event
     * @param _ci
     */
    $scope.onRevisionClick = function ($event, _ci) {

        $scope.active_ci = _.first(_.filter($scope.displayed_stapled_cis, function (ci) {
            return ci._id === _ci._id;
        }));

        //Load this CI
        $scope.loadCI();
    };

    /**
     * this is fired when the checkbox of a revision in the revisions list is clicked
     * @param $event
     * @param _ci
     */
    $scope.onRevisionCheckboxClick = function ($event, _ci) {
    };

    /**
     * this is to upload the ci
     */
    $scope.onClickUpload = function () {
        //TODO: $location.path('/cc/add_ci');
    };

    /**
     * this is to open the compare the selected CIs
     */
    $scope.onClickCompare = function () {
        //TODO:
    };

    $scope.onVersionNotesSaveClick = function (event) {

        $scope.prevNotes = $scope.active_ci.note;

        DataService
            .CI
            .setNote($scope.active_ci._id, $scope.active_ci.note)
            .then(function () {

                NotifierService.notifySuccess('Notes saved for CI (' + $scope.active_ci._id + ').');
            })
            .catch(function () {

                NotifierService.notifyError('Failed to save notes for CI (' + $scope.active_ci._id + ').');
            });
    };

    $scope.onVersionNotesCancelClick = function (event) {
        $scope.active_ci.note = $scope.prevNotes;
    };

    $scope.prevNotes = '';

    $scope.onVersionNotesEditClick = function (event) {
        $scope.prevNotes = $scope.active_ci.note;
    };
    // </editor-fold>

    // <editor-fold desc="Load CI & Load PDF">
    $scope.loadCI = function (_ci) {

        if (_.isEmpty(_ci)) {
            _ci = $scope.active_ci;
        }

        //$scope.hasEmail = $scope.active_ci.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL;

        $scope.showViewSelectButton = ($scope.active_ci.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
                                       $scope.active_ci.ingest.files.original && $scope.active_ci.ingest.files.email);

        $scope.hasEmail = ($scope.active_ci.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL &&
                           $scope.active_ci.ingest.files.email);

        $scope.bShowEmail = ($scope.active_ci.ingest.method === APP_CONFIG.INGEST.METHOD.EMAIL && !$scope.active_ci.ingest.files.original);

        prepareActionsDropDown();
        loadPDFDocument();
    };

    var $jQL = jQuery.noConflict();
    var pdfWrapperContent = "<div id='pdfContainer' class='pdf-content'></div>" +
        "<img id='imgAnnotatable' class='annotatable annotatable-img' " +
        "src='../../custom-vendor/annotorious/transparent.gif'>";

    $scope.ADD_ANNOTATIONS = true;
    $scope.ANNOTATORJS_LOADED = false;

    $scope.scale = $scope.scale || 999;

    function loadPDFDocument() {

        $scope.$canvas = $jQL("<canvas></canvas>");

        //this is to reset the previous values
        PDFJS.disableWorker = true;

        $scope.PDFDOC = {
            pdfDoc: null,
            pageNum: 1,
            pageCount: 1,
            pageRendering: false,
            pageNumPending: null
        };

        /*
          if ($scope.annotationToHighlight){
          $scope.PDFDOC.pageNum = $scope.annotationToHighlight.page;
          }
        */

        //var pdfURL = ($scope.active_ci.ingest.files.common) ? $scope.active_ci.ingest.files.common.url : null;
        var ingestUrl = ($scope.active_ci.ingest.files.common) ? $scope.active_ci.ingest.files.common.url : null;
        var pid = ingestUrl.match(/(?:\/.*\/(.*:?))\.pdf/i)[1];
        var pdfURL = '/api/pdf/' + pid;
        if (pdfURL) {

            //append canvas here, so we don't have to append it again!
            $jQL("#pdfWrapper").empty().append($scope.$canvas);

            UtilsService.showProgressBar('ci_modal_progress');
            PDFJS
                .getDocument(pdfURL)
                .then(function (pdfDoc_) {
                    $scope.$apply(function () {
                        $scope.PDFDOC.pdfDoc = pdfDoc_;
                        $scope.PDFDOC.pageCount = $scope.PDFDOC.pdfDoc.numPages;
                    });
                    // Initial/first page rendering
                    renderPage($scope.PDFDOC.pageNum);
                });

        } else {
            UtilsService.hideProgressBar('ci_modal_progress');
            //TODO: show that URL is missing on the CI??
        }
    }

    function renderPage(num) {
    	
        if ($scope.postLoadVersionForAnnotationToHighlight) {
            $scope.postLoadVersionForAnnotationToHighlight();
            $scope.postLoadVersionForAnnotationToHighlight = undefined;
            return;
        }

        $scope.ciId = $scope.active_ci._id;
        $scope.rotate = $scope.active_ci.rotation;
        $scope.PDFDOC.pageRendering = true;
        $jQL("#pdfWrapper").empty().html(pdfWrapperContent);

        // Using promise to fetch the page
        $scope.PDFDOC.pdfDoc.getPage(num)
            .then(function (page) {

                var wrapperWidth = angular.element('#pdfWrapper').width();
                $scope.scale = $scope.scale == 999 ? (wrapperWidth / page.getViewport(1.0).width) : $scope.scale;

                var viewport = page.getViewport($scope.scale, $scope.rotate);
                var canvas = $scope.$canvas.get(0);
                var context = canvas.getContext("2d");
                canvas.height = viewport.height - 25;
                canvas.width = viewport.width - 25;

                $jQL('#pdfContainer, #imgAnnotatable')
                    .width(viewport.width - 25)
                    .height(viewport.height - 25);

                //Append the canvas to the pdf container div
                $jQL("#pdfContainer").append($scope.$canvas);

                page.getTextContent()
                    .then(function (textContent) {

                        var renderContext = {
                            canvasContext: context,
                            viewport: viewport
                            //textLayer: textLayer
                        };

                        var renderTask = page.render(renderContext);
                        // Wait for rendering to finish
                        renderTask
                            .then(function () {

                                $scope.PDFDOC.pageRendering = false;

                                if ($scope.PDFDOC.pageNumPending !== null) {
                                    // New page rendering is pending
                                    renderPage($scope.PDFDOC.pageNumPending);
                                    $scope.PDFDOC.pageNumPending = null;
                                }
                                UtilsService.hideProgressBar('ci_modal_progress');

                                setupAnnotations();

                                //william: re-active 'zoom' button.
                                $scope.$broadcast('zoom-processing', 'done');

                                //this is to set jScroll for PDFWrapper
                                //Set_PDF_jScroll();
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
                }, 100);
            }
        } else {
            var settings = {
                verticalGutter: 0,
                horizontalGutter: 0,
                autoReinitialise: true,
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
    // </editor-fold>

    // <editor-fold desc="Edit Metadata Modal">
    $scope.editCIMedatadata = function ($event) {

        //open a modal on top of this modal
        var editModalInstance = $modal.open({
            templateUrl: 'EDIT_CI_METADATA_MODAL',
            controller: 'CopyCoordinatorEditCIMetadataCtrl',
            windowClass: 'edit-meta-data',
            backdrop: 'static',
            //backdropClass: 'edit-meta-data modal',
            resolve: {
                ciId: [function () {
                    var _ciId = Restangular.copy($scope.active_ci._id);
                    return _ciId;
                }],
                /*ci: [function () {
                    //restangular copy is required!
                    var _ci = Restangular.copy($scope.ci);
                    if (_ci.hasOwnProperty("__docVersion")) {
                        _ci.__docVersion = undefined;
                    }

                    return _ci;
                }],*/
                //PavaniKa - https://github.com/mgonto/restangular/issues/769
                ci: ['CI', function (CI) {
                    var _ciId = Restangular.copy($scope.active_ci._id);
                    return CI.one(_ciId).get()
                        .then(function (_ci) {
                            if (_ci && _ci.hasOwnProperty("__docVersion")) {
                                _ci.__docVersion = undefined;
                            }

                            return _ci;
                        });
                }],
                metadata: [
                    'mvIdentity', 'DataService',
                    function (mvIdentity, DataService) {

                    return $q.all(
                        [

                            DataService
                                .MediaCompanies
                                .getProgramsForNetwork(mvIdentity.currentUser.affiliation.ref_id,
                                                       mvIdentity.currentUser.affiliation.metadata.active_network),
                            DataService
                                .MediaCompanies
                                .getCITypes(mvIdentity.currentUser.affiliation.ref_id)
                            /*DataService.CI.getTypesForSelect(mvIdentity.currentUser.affiliation.ref_id)*/
                        ])
                        .then(function (data) {

                            if (!data) {
                                return;
                            }

                            return {
                                programs: data[0],
                                types: data[1]
                            };
                        });
                }]
            }
        });

        editModalInstance
            .result
            .then(function (_ci) {

                if (_ci) {
                    $log.debug('Edit Metadata Modal closed at: ' + new Date());
                    $scope.CI_UPDATED_FLAG = true;
                    refreshCI(_ci);
                }
            }, function (reason) {
                $log.debug('Edit Metadata dismissed at: ' + new Date());
            });
    };

    function refreshCI(_ci) {

        if ($scope.stapled_cis.length > 0) {
            /*$scope.active_ci = _.first(_.filter($scope.displayed_stapled_cis, function (ci) {
              return ci._id === _ci._id;
              }));*/
            //TODO: Do we need to refresh versions???
        }
        else {

            $scope.ci = _ci;
            $scope.active_ci = _ci;

            //TODO: This needs to be done from CopyCoordinatorQueueCtrl where the possible revision gets closed.
            //Check if this CI has the 'stapled_to', it means that this CI now part of a bundle.
            //So we need to close the CI Details screen (if it is opened) for the user to go to the Compare screen.
            /*
              if (_ci.possible_revision === true || _ci.possibly_revised === true) {
              $scope.cancel();
              }
              else {
              //no flag exists, reload this CI.
              $scope.loadCI($scope.active_ci);
              }
            */

            $scope.loadCI($scope.active_ci);
        }
    }
    // </editor-fold>

    // <editor-fold desc="View Email">
    $scope.bShowEmail = false;
    $scope.onViewEmailClick = function ($event) {
        $scope.bShowEmail = !$scope.bShowEmail;

        if ($scope.bShowEmail) {
            //set email DIV height to pdf DIV's height
            var pdfDiv = angular.element('.wrapper-pdf-placeholder');
            var emailDiv = angular.element('.email-placeholder');

            if (emailDiv) {
                emailDiv.height(pdfDiv.height());
            }
        }
    };
    //</editor-fold>

    function setupAnnotations() {

        if ($scope.ANNOTATORJS_LOADED == true) {
            // Destroy annotator Instance along with plugins
            $jQL.each(Annotator._instances.slice(0), function () {
                this.destroy();
            });

            $jQL('.annotations-list-uoc').remove();
        }// else do nothing

        if ($jQL('#pdfWrapper').length) {

            //$log.debug('Adding annotations...' + $scope.ANNOTATORJS_LOADED);
            var pdfWrapperInstance = $jQL('#pdfWrapper'),
                annotatorInstance = null,
                categories = {
                    subratllat: 'annotator-hl-subratllat',
                    destacat: 'annotator-hl-destacat',
                    errata: 'annotator-hl-errata',
                    clearstuck: 'annotator-hl-clearstuck'
                };

            pdfWrapperInstance.annotator();
            annotatorInstance = pdfWrapperInstance.data('annotator');

            annotatorInstance.addPlugin('AnnotationStore', {
                loadFromSearch: true,
                onAnnotationStoreApiRequest: function (action, obj, onSuccess) {
                    handleAnnotationApiRequest(action, obj, onSuccess);
                }
            });

            //Permissions
            annotatorInstance.addPlugin('Permissions', {
                permissions: {
                    'read': [mvIdentity.currentUser.userName],
                    'update': [mvIdentity.currentUser.userName],
                    'delete': [mvIdentity.currentUser.userName],
                    'admin': [mvIdentity.currentUser.userName]
                },
                user: mvIdentity.currentUser.userName,

                userId: function (user) {
                    if (user && user.id) {
                        return user.id;
                    }
                    return user;
                },
                userString: function (user) {
                    if (user && user.username) {
                        return user.username;
                    }
                    return user;
                },
                userAuthorize: function (action, annotation, user) {

                    return true;
                },
                showViewPermissionsCheckbox: false,
                showEditPermissionsCheckbox: false
            });


            annotatorInstance.addPlugin('Categories',
                                        {
                                            categories: categories,
                                            //user: mvIdentity.currentUser.userName,
                                            user: mvIdentity.currentUser.firstName + " " + mvIdentity.currentUser.lastName,
                                            getCI: function () {
                                                return $scope.active_ci;
                                            }
                                        });

            //sideviewer plugin:
            annotatorInstance.addPlugin('AnnotatorViewer');

            //Annotation Marker used to mark anotation/ CI with a category based on an event
            annotatorInstance.addPlugin('AnnotatorMarker',
                                        {
                                            markerEventHandlers: {
                                                load: function (options) {

                                                    if (options && options.hasOwnProperty("stuckMarkCount") && options.stuckMarkCount > 0) {
                                                        $log.debug(options.stuckMarkCount);
                                                    }
                                                    else if (options && options.hasOwnProperty("notReviewedCount") && options.notReviewedCount > 0) {
                                                        $log.debug(options.notReviewedCount);
                                                    }
                                                    else if (options && options.hasOwnProperty("MarkAsAppliedCount") && options.MarkAsAppliedCount > 0) {
                                                        $log.debug(options.MarkAsAppliedCount);
                                                    }
                                                },
                                                create: function (options) {

                                                    if (options && options.hasOwnProperty("stuckMarkCount") &&
                                                        options.stuckMarkCount === 1 &&
                                                        options.category &&
                                                        options.category === "errata") {

                                                        updateCIStuckStatus(true);

                                                    }
                                                    else if (options.category && options.category === "destacat") {

                                                        if (options && options.hasOwnProperty("notReviewedCount") && options.notReviewedCount === 0) {
                                                            updateCIReviewedStatus(false);
                                                        }
                                                        else if (options && options.hasOwnProperty("notReviewedCount") && options.notReviewedCount === 1) {
                                                            updateCIReviewedStatus(true);
                                                        }

                                                        if (options && options.hasOwnProperty("MarkAsAppliedCount") && options.MarkAsAppliedCount === 1) {
                                                            updateCIMarkedAsAppliedStatus(true);
                                                        }
                                                    }
                                                },
                                                update: function (options) {

                                                    console.log("Stuck Flag update operation : Stuck:: " + options.stuckMarkCount + ", " + options.category);

                                                    if (options &&
                                                        options.hasOwnProperty("stuckMarkCount") &&
                                                        options.stuckMarkCount === 0 &&
                                                        options.category &&
                                                        options.category === "clearstuck") {

                                                        updateCIStuckStatus(false);
                                                    }
                                                    else if (options &&
                                                             options.hasOwnProperty("stuckMarkCount") &&
                                                             options.stuckMarkCount === 1 &&
                                                             options.category &&
                                                             options.category === "errata") {

                                                        updateCIStuckStatus(true);
                                                    }
                                                    else if (options.category && options.category === "destacat") {

                                                        if (options &&
                                                            options.hasOwnProperty("notReviewedCount") &&
                                                            options.notReviewedCount === 0) {

                                                            updateCIReviewedStatus(false);

                                                        }
                                                        else if (options &&
                                                                 options.hasOwnProperty("notReviewedCount") &&
                                                                 options.notReviewedCount === 1) {

                                                            updateCIReviewedStatus(true);
                                                        }
                                                    }
                                                },
                                                delete: function (options) {

                                                    if (options &&
                                                        options.hasOwnProperty("stuckMarkCount") &&
                                                        options.stuckMarkCount === 0 &&
                                                        options.category && options.category === "errata") {

                                                        updateCIStuckStatus(false);
                                                    }
                                                    else if (options.category &&
                                                             options.category === "destacat") {

                                                        if (options && options.hasOwnProperty("notReviewedCount") && options.notReviewedCount === 0) {
                                                            updateCIReviewedStatus(false);
                                                        }

                                                        if (options && options.hasOwnProperty("MarkAsAppliedCount") && options.MarkAsAppliedCount === 0) {
                                                            updateCIMarkedAsAppliedStatus(false);
                                                        }
                                                    }
                                                }
                                            }
                                        });

            // Annotorious image-plugin
            // Add this after all plugins to ensure this plugin receives data written by other plugins during CRUD operations
            annotatorInstance.addPlugin('AnnotoriousImagePlugin', {
                scale: $scope.scale
            });
            //$scope.annotationToHighlight = {id: "ANN_ID_1429564383317"};

            annotatorInstance.subscribe("annotationsLoaded", function (annotations) {
                annotatorInstance.unsubscribe("annotationsLoaded");

                if ($scope.annotationToHighlight) {

                    var annotationsLength = annotations.length;
                    for (var i = 0; i < annotationsLength; i++) {
                        var annotationObj = annotations[i];

                        if ($scope.annotationToHighlight.id === annotationObj.id) {

                            if (annotatorInstance.plugins.AnnotoriousImagePlugin) {
                                annotatorInstance.publish('onReferenceAnnotationMouseOver', annotationObj);
                                $scope.annotationToHighlight = undefined;
                            }
                            return;
                        }
                    }
                }
            });

            $scope.$broadcast("setupAnnotations");
        }

        /*
         * wait until the current digest cycle is over to update the flag!
         * This is to prevent Error: [$rootScope:inprog] $digest already in progress
         */
        $timeout(function () {

            $scope.$apply(function () {

                $scope.ANNOTATORJS_LOADED = true;

                /**
                 * william: re-activate 'zoom' button after delay 2 seconds.
                 * This is to prevent user from continuously quick-click zooming.
                 */
                $scope.$broadcast('zoom-processing', 'done');

                //this is to set jScroll for PDFWrapper
                //Set_PDF_jScroll();
            });
        });
    }

    $scope.loadCIOnAnnotationClick = function(annotation){

        function postLoad() {

            $scope.postLoadVersionForAnnotationToHighlight = undefined;

            if (annotation.page) {
                $scope.PDFDOC.pageNum = parseInt(annotation.page);
            }
            $scope.annotationToHighlight = angular.copy(annotation);
            $scope.gotoPage();
        }

        if ($scope.stapled_cis.length > 0) {

            var ciLength = $scope.stapled_cis.length;
            var ciObj = null;

            for (var ind = 0; ind < ciLength; ind++) {

                ciObj = $scope.stapled_cis[ind];
                if (ciObj.id === annotation.ciId) {
                    $scope.active_ci = ciObj;
                }
            }
            $scope.postLoadVersionForAnnotationToHighlight = postLoad;
            $scope.loadCI($scope.active_ci);
        }
        else {
            postLoad();
        }
    };

    function adjustAnnotationShape(shape, create) {
	
        //var newShape = angular.copy(shape), geo = newShape.geometry, zscale = $scope.scale;
	
        var newShape = shape;
        var geo = newShape.geometry;
	var zscale = $scope.scale;
	
        if (zscale !== 1) {
	    
            if (!create) {
                geo.x = Number((geo.x * zscale).toFixed(2));
                geo.y = Number((geo.y * zscale).toFixed(2));
                geo.width = Number((geo.width * zscale).toFixed(2));
                geo.height = Number((geo.height * zscale).toFixed(2));
            }
	    else {
                geo.x = Number((geo.x / zscale).toFixed(2));
                geo.y = Number((geo.y / zscale).toFixed(2));
                geo.width = Number((geo.width / zscale).toFixed(2));
                geo.height = Number((geo.height / zscale).toFixed(2));
            }
        }

        return newShape;
    }

    function handleAnnotationApiRequest(action, obj1, onSuccess) {

        var obj = angular.copy(obj1);

        var successNotification = "", errorNotification = "", handleSuccess = null, onError = null;
        successNotification = "'" + action + "'" + " annotation was successful";
        errorNotification = "Failed to " + "'" + action + "'" + " annotation";
	
        handleSuccess = function (data) {
	    
            if (action !== "search") {
		
                if (data && data.shapes && data.shapes.length !== 0) {
		    
                    var newShape = adjustAnnotationShape(data.shapes[0], false);
                    data.shapes[0] = newShape;
                }
                NotifierService.notifySuccess(successNotification);
            }
	    else {
		
                if (data && data.length !== 0) {
		    
                    data.forEach(function (annotation) {
			
                        if (annotation.shapes && annotation.shapes.length !== 0) {
                            var newShape = adjustAnnotationShape(annotation.shapes[0], false);
                            annotation.shapes[0] = newShape;
                        }
                    });
                }
	    }
	    
            if (action === "create") {
                $scope.$broadcast("annotationCreated");
            }
	    else if (action === "destroy") {
                $scope.$broadcast("annotationDeleted");
            }
	    
            onSuccess(data);
        };
	
        onError = function () {
            NotifierService.notifySuccess(errorNotification);
        };

        if (action === "create") {
            if (obj && obj.shapes && obj.shapes.length !== 0) {
                var newShape = adjustAnnotationShape(obj.shapes[0], true);
                obj.shapes[0] = newShape;
            }
            if (obj) {
                obj.network = $scope.ci.network;
            }
            DataService.Annotations.createAnnotation($scope.ciId, $scope.PDFDOC.pageNum, obj).then(handleSuccess).catch(onError);
        }
	else if (action === "update") {
            if (obj && obj.shapes && obj.shapes.length !== 0) {
                var newShape = adjustAnnotationShape(obj.shapes[0], true);
                obj.shapes[0] = newShape;
            }
            DataService.Annotations.updateAnnotation(obj.id, obj).then(handleSuccess).catch(onError);
        }
	else if (action === "destroy") {
            DataService.Annotations.removeAnnotation(obj.id, obj).then(handleSuccess).catch(onError);
        }
	else if (action === "search") {
            DataService.Annotations.getAnnotations($scope.ciId, $scope.PDFDOC.pageNum).then(handleSuccess).catch(onError);
        }
    }

    function updateCIMarkedAsAppliedStatus(isMarkedAsApplied) {

        console.log("isMarkedAsApplied Flag operation : isMarkedAsApplied:: " + isMarkedAsApplied);

        var successNotification = "";
	var errorNotification = "";
	
        if (isMarkedAsApplied) {
            successNotification = "Successfully created a MarkedAsApplied flag on CI: ";
            errorNotification = "Failed to create a MarkedAsApplied flag on CI: ";
        }
	else {
            successNotification = "Successfully cleared a MarkedAsApplied flag on CI: ";
            errorNotification = "Failed to clear a MarkedAsApplied flag on CI: ";
        }

        handleUpdateCIMarkedAsAppliedStatus(isMarkedAsApplied, $scope.ci, function (data) {
            //NotifierService.notifySuccess(successNotification + $scope.ci._id);
        }, function () {
            NotifierService.notifyError(errorNotification + $scope.ci._id);
        });
    }

    function handleUpdateCIMarkedAsAppliedStatus(isMarkedAsApplied, ci, onSuccess, onError) {

        var isReviewed;

        console.log("isMarkedAsApplied Flag operation REST : isMarkedAsApplied:: " + isMarkedAsApplied + ", " + ci._id + ", " + $scope.active_ci._id);

        if (isMarkedAsApplied) {

            /*data service to set the reviewed flag on both bundle & version*/
            DataService
                .CI
                .setMarkAsAppliedFlag(ci._id, $scope.active_ci._id)
                .then(function (_ci) {

                    //                    $scope.ci = angular.isArray(_ci) ? _ci[0] : _ci;
                    $scope.ci.markedAsApplied = isMarkedAsApplied;
                    $scope.active_ci.markedAsApplied = isMarkedAsApplied;
                    onSuccess.call();
                })
                .catch(function (error) {
                    onError.call();
                });

        } else {

            DataService
                .Annotations
                .getAnnotationsCountByCategory(ci._id, "destacat")
                .then(function (data) {
                    //this is for the parent id
                    if (data.count === 0) {

                        /*data service to clear the markedAsApplied flag on the bundle & version*/
                        DataService
                            .CI
                            .clearMarkAsAppliedFlag(ci._id, $scope.active_ci._id)
                            .then(function (_ci) {

                                //                                $scope.ci = angular.isArray(_ci) ? _ci[0] : _ci;
                                $scope.ci.markedAsApplied = isMarkedAsApplied;

                                onSuccess.call();
                            })
                            .catch(function (error) {
                                onError.call();
                            });

                    } else {
                        // markedAsApplied annotations still exist, across pages / versions
                        //so check if there a re markedAsApplied annotations for the active/selected version
                        DataService
                            .Annotations
                            .getAnnotationsCountByCategory($scope.active_ci._id, "destacat")
                            .then(function (data) {
                                //this is for the parent id
                                if (data.count === 0) {
                                    /*data service to clear the markedAsApplied flag on the bundle & version*/
                                    DataService
                                        .CI
                                        .clearMarkAsAppliedFlag($scope.active_ci._id, $scope.active_ci._id)
                                        .then(function (_ci) {

                                            $scope.active_ci.markedAsApplied = isMarkedAsApplied;
                                            onSuccess.call();
                                        })
                                        .catch(function (error) {
                                            onError.call();
                                        });

                                } else {
                                    // markedAsApplied annotations still exist, across pages / versions
                                    //check for the selected version

                                }
                            })
                            .catch(onError);
                    }
                })
                .catch(onError);
        }
    }

    function updateCIReviewedStatus(notReviewed) {

        console.log("Reviewed Flag operation : Reviewed:: " + notReviewed);

        var successNotification = "", errorNotification = "";
        if (notReviewed) {
            successNotification = "Successfully created a notReviewed flag on CI: ";
            errorNotification = "Failed to create a notReviewed flag on CI: ";
        } else {
            successNotification = "Successfully cleared a notReviewed flag on CI: ";
            errorNotification = "Failed to clear a notReviewed flag on CI: ";
        }

        handleUpdateCIReviewedStatus(notReviewed, $scope.ci, function (data) {
            //NotifierService.notifySuccess(successNotification + $scope.ci._id);
        }, function () {
            NotifierService.notifyError(errorNotification + $scope.ci._id);
        });
    }

    function handleUpdateCIReviewedStatus(notReviewed, ci, onSuccess, onError) {

        var isReviewed;
        console.log("notReviewed Flag operation REST : notReviewed:: " + notReviewed + ", " + ci._id + ", " + $scope.active_ci._id);

        if (notReviewed) {
            /*data service to set the reviewed flag on both bundle & version*/
            DataService
                .CI
                .setNotReviewedFlag(ci._id, $scope.active_ci._id)
                .then(function (_ci) {

                    //                    $scope.ci = angular.isArray(_ci) ? _ci[0] : _ci;
                    $scope.ci.notReviewed = notReviewed;
                    $scope.active_ci.notReviewed = notReviewed;
                    onSuccess.call();
                })
                .catch(function (error) {
                    onError.call();
                });
        } else {

            DataService
                .Annotations
                .getAnnotationsCountByCategory(ci._id, "destacat", {reviewed: false})
                .then(function (data) {
                    //this is for the parent id
                    if (data.count === 0) {

                        /*data service to clear the reviewed flag on the bundle & version*/
                        DataService
                            .CI
                            .clearNotReviewedFlag(ci._id, $scope.active_ci._id)
                            .then(function (_ci) {

                                //                                $scope.ci = angular.isArray(_ci) ? _ci[0] : _ci;
                                $scope.ci.notReviewed = notReviewed;
                                $scope.active_ci.notReviewed = notReviewed;
                                onSuccess.call();
                            })
                            .catch(function (error) {
                                onError.call();
                            });

                    } else {
                        // unreviewed annotations still exist, across pages / versions
                        //so check if there a re unreviewed annotations for the active/selected version
                        DataService
                            .Annotations
                            .getAnnotationsCountByCategory($scope.active_ci._id, "destacat", {reviewed: false})
                            .then(function (data) {
                                //this is for the parent id
                                if (data.count === 0) {
                                    /*data service to clear the stuck flag on the bundle & version*/
                                    DataService
                                        .CI
                                        .clearNotReviewedFlag($scope.active_ci._id, $scope.active_ci._id)
                                        .then(function (_ci) {

                                            $scope.active_ci.notReviewed = notReviewed;
                                            onSuccess.call();
                                        })
                                        .catch(function (error) {
                                            onError.call();
                                        });

                                } else {
                                    // Stuck annotations still exist, across pages / versions
                                    //check for the selected version

                                }
                            })
                            .catch(onError);
                    }
                })
                .catch(onError);

        }
    }

    function updateCIStuckStatus(isStuck) {

        console.log("Stuck Flag operation : Stuck:: " + isStuck);

        var successNotification = "", errorNotification = "";
        if (isStuck) {
            successNotification = "Successfully created a Stuck flag on CI: ";
            errorNotification = "Failed to create a Stuck flag on CI: ";
        } else {
            successNotification = "Successfully cleared a Stuck flag on CI: ";
            errorNotification = "Failed to clear a Stuck flag on CI: ";
        }

        //if ((!$scope.ci.stuck && isStuck) || ($scope.ci.stuck && !isStuck)) {
        updateCIStatus(isStuck, $scope.ci, function (data) {
            //$scope.selectedStatus.value = APP_CONFIG.CI.STATUS.IN_PROGRESS;
            NotifierService.notifySuccess(successNotification + $scope.ci._id);
        }, function () {
            NotifierService.notifyError(errorNotification + $scope.ci._id);
        });
        //}
    }

    function updateCIStatus(isStuck, ci, onSuccess, onError) {

        console.log("Stuck Flag operation REST : Stuck:: " + isStuck + ", " + ci._id + ", " + $scope.active_ci._id);

        if (isStuck) {
            //ci.status = APP_CONFIG.CI.STATUS.IN_PROGRESS;
            //ci.stuck = isStuck;
            //ci.put().then(onSuccess).catch(onError);

            /*data service to set the stuck flag on both bundle & version*/
            DataService
                .CI
                .setStuckFlag(ci._id, $scope.active_ci._id)
                .then(function (_ci) {

                    //                    $scope.ci = angular.isArray(_ci) ? _ci[0] : _ci;
                    $scope.ci.stuck = isStuck;
                    $scope.active_ci.stuck = isStuck;
                    onSuccess.call();
                })
                .catch(function (error) {
                    onError.call();
                });

        } else {

            DataService
                .Annotations
                .getAnnotationsCountByCategory(ci._id, "errata")
                .then(function (data) {
                    //this is for the parent id
                    if (data.count === 0) {
                        //ci.stuck = isStuck;
                        //ci.put().then(onSuccess).catch(onError);

                        /*data service to clear the stuck flag on the bundle & version*/
                        DataService
                            .CI
                            .clearStuckFlag(ci._id, $scope.active_ci._id)
                            .then(function (_ci) {

                                //                                $scope.ci = angular.isArray(_ci) ? _ci[0] : _ci;
                                $scope.ci.stuck = isStuck;
                                $scope.active_ci.stuck = isStuck;
                                onSuccess.call();
                            })
                            .catch(function (error) {
                                onError.call();
                            });

                    } else {
                        // Stuck annotations still exist, across pages / versions
                        //so check if there a re stuck annotations for the active/selected version
                        DataService
                            .Annotations
                            .getAnnotationsCountByCategory($scope.active_ci._id, "errata")
                            .then(function (data) {
                                //this is for the parent id
                                if (data.count === 0) {
                                    /*data service to clear the stuck flag on the bundle & version*/
                                    DataService
                                        .CI
                                        .clearStuckFlag($scope.active_ci._id, $scope.active_ci._id)
                                        .then(function (_ci) {

                                            $scope.active_ci.stuck = isStuck;
                                            onSuccess.call();
                                        })
                                        .catch(function (error) {
                                            onError.call();
                                        });

                                } else {
                                    // Stuck annotations still exist, across pages / versions
                                    //check for the selected version

                                }
                            })
                            .catch(onError);
                    }
                })
                .catch(onError);
        }
    }
}

angular.module('trafficbridge.cc').
    controller('CopyCoordinatorCIModalCtrl', [
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$modalInstance',
        '$modal',
        '$q',
        '$log',
        '$http',
        'mvIdentity',
        'DataService',
        'NotifierService',
        'UtilsService',
        'ciId',
        'ci',
        'stapled_cis',
        'parkinglot',
        'users',
        'APP_CONFIG',
        'Restangular',
        CopyCoordinatorCIModalCtrl
    ]);
