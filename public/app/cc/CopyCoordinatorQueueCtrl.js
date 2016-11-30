function CopyCoordinatorQueueCtrl($scope,
                                  $location,
                                  $routeParams,
                                  $modal,
                                  $timeout,
                                  $q,
                                  $log,
                                  mvIdentity,
                                  DataService,
                                  CIPollerService,
                                  FilterService,
                                  queue,
                                  owners,
                                  cis,
                                  counts,
                                  APP_CONFIG,
                                  SEARCH_ID,
                                  CI,
                                  USER_ROLES) {

    //<editor-fold desc="Owners Filter">
    $scope.ownersNowList = owners;

    $scope.reloadQueueCounts = function () {
        //console.log('CopyCoordinatorQueueCtrl reloadQueueCounts...');
        //catch this in CopyCoordinatorLeftNavCtrl, to refersh the counts
        $scope.$broadcast('owner-select', 'refresh');
        //refresh the CI cards by recreating the poller
        $scope.ciPoller = CIPollerService.create(queue);
    };

    //</editor-fold>

    ////////////////////////////////////////
    //this is taken from CopyCoordinatorHomeCtrl, that controller is not used anymore!
    //add scrolling behavior to the 'content' section only once
    var _SCROLL_BEHAVIOR_ADDED = false;

    //on content loaded:
    $scope.$on('$includeContentLoaded', function (event, url) {

        if (_.endsWith(url, 'ci_card.html')) {

            if (!_SCROLL_BEHAVIOR_ADDED) {

                //console.log('Home $includeContentLoaded: ' + url);
                _SCROLL_BEHAVIOR_ADDED = true;

                if (TPVTB.AddScrollingToHomeScreen && _.isFunction(TPVTB.AddScrollingToHomeScreen)) {
                    //this is defined in home.js from Agility!
                    TPVTB.AddScrollingToHomeScreen();
                }
            }
        }
    });

    ////////////////////////////////////////

    $scope.counts = counts;
    $scope.cis = cis;
    $scope.SEARCH_ID = SEARCH_ID;

    $scope.statuses = DataService.CI.getStatusesForSelect();

    ////////////////////////////////////////

    var _path = $location.path();
    var _pathArray = _path.split('/');
    var _curLeftNavItem = _pathArray[_pathArray.length - 1];

    $scope.showAddCopyInstruction = _curLeftNavItem === APP_CONFIG.QUEUE.NEW;
    $scope.showImportUCR = _curLeftNavItem === APP_CONFIG.QUEUE.UNINSTRUCTED;
    $scope.emailsActive = _curLeftNavItem === APP_CONFIG.QUEUE.EMAILS;
    $scope.showFilters = !($scope.showAddCopyInstruction);
    $scope.showOwnersFilter = $scope.showFilters && (_curLeftNavItem !== 'parkinglot');

    if ($scope.showImportUCR) {

        // TODO Can be improved kenmc
        DataService
            .MediaCompanies
            .getLastImportedUCR(mvIdentity.currentUser.affiliation.ref_id)
            .then(function (lastImportedUCR) {

                if (lastImportedUCR) {
                    $scope.ucrLastImport = lastImportedUCR.created_at;
                }
            });
    }

    ////////////////////////////////////////

    //only poll if we are not in library!
    if (queue !== APP_CONFIG.QUEUE.LIBRARY) {

        $scope.ciPoller = CIPollerService.create(queue);

        $scope.ciPoller
            .promise
            .then(null, null, function (cis) {

                $scope.cis = cis;
            });

        $scope.stopPoller = function () {
            $scope.ciPoller.stop();
        };

        $scope.restartPoller = function () {
            $scope.ciPoller.restart();
        };
    }

    $scope.showGridView = function () {
        $scope.display = 'grid';
    };

    $scope.showListView = function () {
        $scope.display = 'list';
    };

    $scope.display = 'grid';

    $scope.addCopyInstruction = function ($event) {
        openUploadDocumentModal($event);
    };

    $scope.importUCR = function () {
        $location.path('/cc/import_ucr');
    };

    $scope.openCIModal = function ($event, ci) {

        $event.preventDefault();
        $event.stopPropagation();

        var ciId = ci._id;

        if (ci.status === APP_CONFIG.CI.STATUS.DELIVERED ||
                //ci.status === APP_CONFIG.CI.STATUS.IGNORED  ||
            ci.status === APP_CONFIG.CI.STATUS.EMAILS) {

            openFileCIModal(ciId);
        }
        else if (ci.status === APP_CONFIG.CI.STATUS.IGNORED) {
            //if previous_status is delivered, open File CI Modal, else open CI Details Modal
            if (ci.previous_status &&
                (ci.previous_status === APP_CONFIG.CI.STATUS.DELIVERED || ci.previous_status === APP_CONFIG.CI.STATUS.IGNORED)) {
                openFileCIModal(ciId);
            } else {
                openCIDetailsModal(ciId);
            }
        }
        else {

            if (ci.possible_revision) {
                //this is a possible revision (pink hash)
                openCIPossibleRevisionModal(ciId);
            }
            else if (ci.possibly_revised) {
                //this is a candidate (grey hash)
                getPossibleRevisionsForCandidate(ci);
            }
            else {
                openCIDetailsModal(ciId);
            }
        }
    };

    //<editor-fold desc="Upload Document Modal">
    function openUploadDocumentModal($event) {

        $event.preventDefault();
        $event.stopPropagation();

        var uploadDocModalInstance = $modal.open({
            templateUrl: 'UPLOAD_DOCUMENT_MODAL',
            controller: 'UploadDocumentCtrl',
            windowClass: 'upload-document',
            backdrop: 'static'
        });

        uploadDocModalInstance
            .result
            .then(function (uploadedCIId) {

                $log.debug('Upload Document Modal closed at: ' + moment().format('h:mm:ss a') + ', ' + uploadedCIId);
                //$location.path('/cc/metadata/' + uploadedCIId);

                //Open New File Modal from here
                //timeout is to fix the sticky overlay issue between upload & new modals.
                $timeout(function () {
                    openFileCIModal(uploadedCIId);
                }, 10);
            },
            function (reason) {
                $log.debug('Upload Document Modal dismissed at: ' + moment().format('h:mm:ss a'));
            });
    }

    //</editor-fold>

    //<editor-fold desc="File CI Modal">
    function openFileCIModal(ciId) {

        var fileCIModalInstance = $modal.open({
            templateUrl: 'NEW_CI_MODAL',
            controller: 'NewCICtrl',
            windowClass: 'new-copy-instruction',
            backdrop: 'static',
            resolve: {
                ciId: function () {
                    return ciId;
                },
                ci: ['CI', function (CI) {
                    return CI.one(ciId).get();
                }],
                metadata: ['mvIdentity', 'DataService',
                    function (mvIdentity, DataService) {

                        return $q.all(
                            [

                                DataService
                                    .MediaCompanies
                                    .getProgramsForNetwork(mvIdentity.currentUser.affiliation.ref_id,
                                    mvIdentity.currentUser.affiliation.metadata.active_network),
                                DataService
                                    .MediaCompanies
                                    .getUsers(mvIdentity.currentUser.affiliation.ref_id),
                                DataService
                                    .MediaCompanies
                                    .getCITypes(mvIdentity.currentUser.affiliation.ref_id)
                                /*DataService
                                    .CI
                                    .getTypesForSelect(mvIdentity.currentUser.affiliation.ref_id)*/
                            ])
                            .then(function (data) {

                                if (!data) {
                                    return;
                                }

                                return {
                                    programs: data[0],
                                    users: data[1],
                                    types: data[2]
                                };
                            })
                    }]
            },
            data: {
                authorizedRoles: USER_ROLES.media_company_all
            }
        });

        if (queue !== APP_CONFIG.QUEUE.LIBRARY) {

            fileCIModalInstance
                .opened
                .then(function () {

                    // Can be optimized further...
                    $scope.cis = [];
                    if ($scope.ciPoller) {
                        $scope.ciPoller.stop();
                    }
                });
        }

        fileCIModalInstance
            .result
            .then(function () {
                $log.debug('File CI Modal closed at: ' + moment().format('h:mm:ss a'));
                //Refresh Library no matter what!
                if (queue === APP_CONFIG.QUEUE.LIBRARY) {
                    $scope.$broadcast('REFRESH_LIBRARY', 'CI_MODAL');
                }
            },
            function (reason) {
                $log.debug('File CI Modal dismissed at: ' + moment().format('h:mm:ss a'));
                //Refresh Library no matter what!
                if (queue === APP_CONFIG.QUEUE.LIBRARY) {
                    $scope.$broadcast('REFRESH_LIBRARY', 'CI_MODAL');
                }
            })
            .finally(function () {

                if (queue !== APP_CONFIG.QUEUE.LIBRARY) {
                    // Can be optimized further...
                    if ($scope.ciPoller) {
                        $scope.ciPoller.restart();
                    }
                }
            });
    }

    //</editor-fold>

    //<editor-fold desc="CI Details Modal">
    function openCIDetailsModal(ciId) {

        var modalInstance = $modal.open({
            templateUrl: 'VIEW_CI_MODAL',
            controller: 'CopyCoordinatorCIModalCtrl',
            windowClass: 'ci-detail',
            backdrop: 'static',
            //backdropClass: 'modal-backdrop',
            //size: size,
            resolve: {
                ciId: function () {
                    return ciId;
                },
                ci: ['CI', function (CI) {
                    return CI.one(ciId).get();
                }],
                stapled_cis: ['DataService',
                    function (DataService) {
                        return DataService.CI
                            .getStapledCIs(ciId)
                            .then(function (cis) {
                                return cis;
                            });
                    }],
                parkinglot: ['DataService',
                    function (DataService) {
                        return DataService.CI.getParkingLot();
                    }],
                users: ['DataService',
                    function (DataService) {
                        return DataService
                            .MediaCompanies
                            .getUsers(mvIdentity.currentUser.affiliation.ref_id);
                    }]
            }
        });

        if (queue !== APP_CONFIG.QUEUE.LIBRARY) {

            modalInstance
                .opened
                .then(function () {

                    // Can be optimized further...
                    $scope.cis = [];
                    if ($scope.ciPoller) {
                        $scope.ciPoller.stop();
                    }
                });
        }

        modalInstance
            .result
            .then(function (isCIUpdated) {
                $log.debug('CI Modal closed at: ' + new Date());
                //Refresh Library no matter what!
                if (queue === APP_CONFIG.QUEUE.LIBRARY) {
                    $scope.$broadcast('REFRESH_LIBRARY', 'CI_MODAL');
                }
            },
            function (isCIUpdated) {
                $log.debug('CI Modal dismissed at: ' + new Date());
                /*if (queue === APP_CONFIG.QUEUE.LIBRARY && isCIUpdated) {
                 $scope.$broadcast('REFRESH_LIBRARY', 'CI_MODAL');
                 }*/

                //Refresh Library no matter what!
                if (queue === APP_CONFIG.QUEUE.LIBRARY) {
                    $scope.$broadcast('REFRESH_LIBRARY', 'CI_MODAL');
                }
            })
            .finally(function () {

                if (queue !== APP_CONFIG.QUEUE.LIBRARY) {
                    // Can be optimized further...
                    if ($scope.ciPoller) {
                        $scope.ciPoller.restart();
                    }
                }
            });
    }

    //</editor-fold>

    //<editor-fold desc="Possible Revisions CI Modal">
    function openCIPossibleRevisionModal(ciId) {

        var modalInstance = $modal.open({
            templateUrl: 'POSSIBLE_REVISION_CI_MODAL',
            controller: 'PossibleRevisionCICtrl',
            windowClass: 'compare-revision',
            backdrop: 'static',
            //backdropClass: 'modal-backdrop',
            //size: size,
            resolve: {
                ciId: function () {
                    return ciId;
                },
                ci: ['CI', function (CI) {
                    return CI.one(ciId).get();
                }],
                revised_candidates: ['DataService',
                    function (DataService) {
                        return DataService.CI
                            .getPossiblyRevisedCandidates(ciId)
                            .then(function (cis) {
                                return cis;
                            });
                    }]
            }
        });

        if (queue !== APP_CONFIG.QUEUE.LIBRARY) {
            modalInstance
                .opened
                .then(function () {

                    // Can be optimized further...
                    $scope.cis = [];
                    if ($scope.ciPoller) {
                        $scope.ciPoller.stop();
                    }
                });
        }

        modalInstance
            .result
            .then(function (isCIUpdated) {
                $log.debug('Possible Revision Modal closed at: ' + new Date());
                //Refresh Library no matter what!
                if (queue === APP_CONFIG.QUEUE.LIBRARY) {
                    $scope.$broadcast('REFRESH_LIBRARY', 'POSSIBLE_REVISION_MODAL');
                }

                //TODO: Check if this CI has the 'stapled_to', it means that this CI now part of a bundle.
                //So we need to close the CI Details screen (if it is opened) for the user to go to the Compare screen.
            },
            function (reason) {
                $log.debug('Possible Revision Modal dismissed at: ' + new Date());
                if (queue === APP_CONFIG.QUEUE.LIBRARY) {
                    $scope.$broadcast('REFRESH_LIBRARY', 'POSSIBLE_REVISION_MODAL');
                }
            })
            .finally(function () {

                if (queue !== APP_CONFIG.QUEUE.LIBRARY) {
                    // Can be optimized further...
                    if ($scope.ciPoller) {
                        $scope.ciPoller.restart();
                    }
                }
            });
    }

    $scope.$on('open-compare-revision', function (event, ciId) {

        if (ciId) {
            openCIPossibleRevisionModal(ciId);
        }

    });

    /**
     * this is to get the possible revisions of a candidate CI when it is clicked.
     * @param candidateCI
     */
    function getPossibleRevisionsForCandidate(candidateCI) {

        DataService.CI
            .getPendingDecisions(candidateCI._id, candidateCI)
            .then(function (cis) {

                //these are the possible revisions of the candidate, open the modal now.
                var possibleRevisionCI = _.find(cis, function (_ci) {
                    return _ci.possible_revision === true;
                });

                if (possibleRevisionCI) {

                    //open it
                    openCIPossibleRevisionModal(possibleRevisionCI._id);
                } else {

                    //we only got the possibly revised/candidate CI, get the possible revision of it.
                    var candidateCI = cis[0];
                    getPossibleRevisionsForCandidate(candidateCI);
                }
            })
            .catch(function (error) {
                console.log('Error while getting pending decisions of the candidate: ' + error);
            });

    }

    //</editor-fold>

    //<editor-fold desc="Pagination for Emails section">
    $scope.pagination = {};
    $scope.pagination.totalItems = $scope.counts.emails;
    $scope.pagination.currentPageNum = 1;
    $scope.pagination.itemsPerPage = 50;

    $scope.pagination.pageChanged = function () {
        //$scope.limitBegin = ($scope.currentPage * $scope.itemsPerPage);
        //$log.debug('###### EMAILS currentPage: ' +$scope.currentPageNum);
    };

    $scope.pagination.PageSizeChange = function ($event, newSize) {
        $scope.pagination.itemsPerPage = parseInt(newSize, 10);
    };
    //</editor-fold>
}

angular
    .module('trafficbridge.cc')
    .controller('CopyCoordinatorQueueCtrl', [
        '$scope',
        '$location',
        '$routeParams',
        '$modal',
        '$timeout',
        '$q',
        '$log',
        'mvIdentity',
        'DataService',
        'CIPollerService',
        'FilterService',
        'queue',
        'owners',
        'cis',
        'counts',
        'APP_CONFIG',
        'SEARCH_ID',
        'CI',
        'USER_ROLES',
        CopyCoordinatorQueueCtrl
    ]);

/**
 * PavaniKa: this directive is used to prevent double clicks on the CI Cards, used in index.html & library.html
 */
angular
    .module('trafficbridge.cc')
    .directive('tbClickOnce', [
        '$timeout',
        function ($timeout) {
            var delay = 1000;

            return {
                restrict: 'A',
                priority: -1,
                link: function (scope, elem) {
                    var disabled = false;

                    function onClick(evt) {
                        if (disabled) {
                            evt.preventDefault();
                            evt.stopImmediatePropagation();
                        } else {
                            disabled = true;
                            $timeout(function () {
                                disabled = false;
                            }, delay, false);
                        }
                    }

                    scope.$on('$destroy', function () {
                        elem.off('click', onClick);
                    });
                    elem.on('click', onClick);
                }
            };
        }]);
