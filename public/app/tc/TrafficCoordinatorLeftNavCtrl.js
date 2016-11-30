function TrafficCoordinatorLeftNavCtrl($scope,
                                       $route,
                                       $location,
				       $log,
                                       mvIdentity,
                                       DataService,
                                       CICountsPollerService,
                                       NotifierService,
                                       AuthService) {

    ///////////////////////
    //START: Based on path toggle the classes, for the new styles to work!
    //////////////////////
    var _path = $location.path();

    var _pathArray = _path.split('/');
    var _curLeftNavItem = _pathArray[_pathArray.length - 1];
    /*$log.debug('### Left Nav Item: ' + _curLeftNavItem);*/

    $scope.isNowClicked = false;
    $scope.nowClass = 'active-sub';

    $scope.newActive = false;
    $scope.nowActive = false;
    /*
    $scope.revisionActive = false;
    $scope.stuckActive = false;
    $scope.uninstructedActive = false;
    */
    $scope.libraryActive = false;
    /*
    $scope.completedActive = false;
    $scope.parkinglotActive = false;
    $scope.archivedActive = false;
    */

    switch(_curLeftNavItem) {
    case 'new':
        $scope.newActive = true;
        break;
    case 'now':
        $scope.nowActive = true;
        $scope.isNowClicked = true;
        break;
	/*
    case 'revision':
        $scope.isNowClicked = true;
        $scope.revisionActive = true;
        break;
    case 'stuck':
        $scope.isNowClicked = true;
        $scope.stuckActive = true;
        break;
    case 'uninstructed':
        $scope.isNowClicked = true;
        $scope.uninstructedActive = true;
        break;
	*/
    case 'library':
        $scope.libraryActive = true;
        break;
	/*
    case 'completed':
        $scope.completedActive = true;
        break;
    case 'parkinglot':
        $scope.parkinglotActive = true;
        break;
    case 'archived':
        $scope.archivedActive = true;
        break;
	*/
    }

    $scope.signout = function() {
        AuthService.logoutUser()
            .then(function() {

                $scope.username = '';
                $scope.password = '';
                //NotifierService.notifySuccess('You signed out successfully!');
                $location.path('/');
            });
    }

    //$log.debug($location.path() + ': ' + $scope.isNowClicked);

    //on content loaded:
    $scope.$on('$includeContentLoaded', function () {
        //$log.debug('LeftNavCtrl $includeContentLoaded');
        TPVTB.ToggleLeftNavigationBar();
    });

    //on content requested:
    $scope.$on('$includeContentRequested', function () {
        //$log.debug('LeftNavCtrl $includeContentRequested');
    });
    ///////////////////////
    //END:
    ///////////////////////

    $scope.signout = function() {

        AuthService.logoutUser()
            .then(function() {

                $scope.username = '';
                $scope.password = '';
                //NotifierService.notifySuccess('You signed out successfully!');
                $location.path('/');
            });
    }

    var countsPoller = CICountsPollerService.create();

    countsPoller
        .promise
        .then(null,null,function(counts) {
            $scope.counts = counts;
        });

    $scope.GotoUserProfile = function(){
        $location.path('/profile');
    };
};

angular
    .module('trafficbridge.tc')
    .controller('TrafficCoordinatorLeftNavCtrl', [
        '$scope',
        '$route',
        '$location',
	'$log',
        'mvIdentity',
        'DataService',
        'CICountsPollerService',
        'NotifierService',
        'AuthService',
        TrafficCoordinatorLeftNavCtrl
    ]);
