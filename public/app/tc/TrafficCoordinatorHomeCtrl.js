function TrafficCoordinatorHomeCtrl($scope,
                                    $location,
                                    $routeParams,
                                    $modal,
                                    $log,
                                    DataService,
                                    CIPollerService,
                                    queue,
                                    cis,
                                    counts,
                                    APP_CONFIG,
                                    DataService) {


    $scope.counts = counts;
    $scope.cis = cis;

    $scope.statuses = DataService.CI.getStatusesForSelect();

    ////////////////////////////////////////
    /*
     var _path = $location.path();
     var _pathArray = _path.split('/');
     var _curLeftNavItem = _pathArray[_pathArray.length - 1];

     $scope.showAddCopyInstruction = _curLeftNavItem === 'new';
     $scope.showImportUCR = _curLeftNavItem === 'uninstructed';
     $scope.showFilters = !($scope.showAddCopyInstruction || $scope.showImportUCR);
     */

    $scope.showAddCopyInstruction = true;
    $scope.showFilters = true;

    ////////////////////////////////////////

    //only poll if we are not in library!
    if (queue !== 'library') {

        var ciPoller = CIPollerService.create(queue);

        ciPoller
            .promise
            .then(null, null, function (cis) {

                $scope.cis = cis;
            });

        $scope.stopPoller = function () {
            ciPoller.stop();
        }

        $scope.restartPoller = function () {
            ciPoller.restart();
        }
    }

    $scope.gotoCI = function (ci) {

        var path = '/tc/view/' + ci._id;

        $location.path(path);
    }

    $scope.showGridView = function () {
        $scope.display = 'grid';
    }

    $scope.showListView = function () {
        $scope.display = 'list';
    }

    $scope.display = 'grid';

    $scope.addCopyInstruction = function () {
        $location.path('/tc/add_ci');
    }

    ////////////////////////////////////////
    //START: Pagination for Emails section //
    ////////////////////////////////////////
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
    ////////////////////////////////////////
    //END: Pagination for Emails section //
    ///////////////////////////////////////    

    ///////////////////////////////////////
    //START: CI Modal Popup
    ///////////////////////////////////////

    $scope.openCIModal = function ($event, ci) {

        $event.preventDefault();
        $event.stopPropagation();

        var ciId = ci._id;

        var modalInstance = $modal.open({
            templateUrl: 'VIEW_CI_MODAL',
            controller: 'TrafficCoordinatorCIModalCtrl',
            windowClass: 'ci-detail',
            backdrop: 'static',
            //backdropClass: 'modal-backdrop',
            //size: size,
            resolve: {
                ciId: function () {
                    return ciId; //testing
                },
                ci: ['CI', function (CI) {
                    return CI.one(ciId).get();
                }],
                stapled_cis: ['DataService', function (DataService) {
                    return DataService.CI
                        .getStapledCIs(ciId)
                        .then(function (cis) {
                            return cis;
                        });
                }],
                parkinglot: ['DataService',
                    function (DataService) {
                        return DataService.CI.getParkingLot();
                    }]
            }
        });

        /*modalInstance.opened.then(function() {
         $log.debug('Modal opened at: ' + new Date());
         });*/

        modalInstance.result.then(function () {
            $log.debug('Modal closed at: ' + new Date());
        }, function (reason) {
            $log.debug('Modal dismissed at: ' + new Date());
        });
    };

    ///////////////////////////////////////
    //END: CI Modal Popup
    ///////////////////////////////////////
}

angular
    .module('trafficbridge.tc')
    .controller('TrafficCoordinatorHomeCtrl', [
        '$scope',
        '$location',
        '$routeParams',
        '$modal',
        '$log',
        'DataService',
        'CIPollerService',
        'queue',
        'cis',
        'counts',
        'APP_CONFIG',
        'DataService',
        TrafficCoordinatorHomeCtrl
    ]);
