function CopyCoordinatorLeftNavCtrl($scope,
                                    $route,
                                    $location,
                                    $log,
                                    mvIdentity,
                                    DataService,
                                    CICountsPollerService,
                                    NotifierService,
                                    AuthService,
                                    $modal) {

    ///////////////////////
    //START: Based on path toggle the classes, for the new styles to work!
    //////////////////////
    var _path = $location.path();

    var _pathArray = _path.split('/');
    var _curLeftNavItem = _pathArray[_pathArray.length - 1];
    $scope.SEARCH_ID = _.startsWith(_curLeftNavItem, 'SEARCH_ID') ? _curLeftNavItem : '';
    /*$log.debug('### Left Nav Item: ' + _curLeftNavItem);*/

    $scope.isNowClicked = false;
    $scope.nowClass = 'active-sub';

    $scope.newActive = false;
    $scope.nowActive = false;
    $scope.revisionActive = false;
    $scope.stuckActive = false;
    $scope.uninstructedActive = false;
    $scope.libraryActive = false;
    $scope.completedActive = false;
    $scope.parkinglotActive = false;
    $scope.archivedActive = false;
    //$scope.emailsActive = false;

    _curLeftNavItem = _.startsWith(_curLeftNavItem, 'SEARCH_ID') ? 'library' : _curLeftNavItem;

    switch(_curLeftNavItem) {
    case 'new':
        $scope.newActive = true;
        break;
    case 'now':
        $scope.nowActive = true;
        $scope.isNowClicked = true;
        break;
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
    case 'library':
        $scope.libraryActive = true;
        break;
    case 'completed':
        $scope.completedActive = true;
        break;
    case 'parkinglot':
        $scope.parkinglotActive = true;
        break;
    case 'archived':
        $scope.archivedActive = true;
        break;
        /*
          case 'emails':
          $scope.emailsActive = true;
          break;
        */
    }

    //this is called when the network dropdown is opened and an option is selected.
    $scope.onNetworkSelect = function(network) {
        $scope.selectedNetwork = network;
        $scope.onChangeNetwork();
    }

    $scope.signout = function() {

        AuthService.logoutUser()
            .then(function() {

                $scope.username = '';
                $scope.password = '';
                //NotifierService.notifySuccess('You signed out successfully!');
                //                $location.path('/');
                location.reload();
            });
    }

    //$log.debug($location.path() + ': ' + $scope.isNowClicked);

    //on content loaded:
    $scope.$on('$includeContentLoaded', function () {
        if(TPVTB.ToggleLeftNavigationBar && _.isFunction(TPVTB.ToggleLeftNavigationBar)) {
            //this is defined in home.js from Agility!
            TPVTB.ToggleLeftNavigationBar();
        }
    });

    //on content requested:
    /*$scope.$on('$includeContentRequested', function () {
    //$log.debug('LeftNavCtrl $includeContentRequested');
    });*/
    ///////////////////////
    //END:
    ///////////////////////

    $scope.networks = _.map(mvIdentity.currentUser.accessibleNetworks,function(network) {
        return { name: network, value: network};
    });

    // Angular is horrible!

    $scope.selectedNetwork = -1;

    if (mvIdentity.currentUser.affiliation.metadata &&
        mvIdentity.currentUser.affiliation.metadata.active_network) {

        var active_network = mvIdentity.currentUser.affiliation.metadata.active_network;

        _.forEach($scope.networks,function(option,idx) {
            if (option.name === active_network) {
                $scope.selectedNetwork = $scope.networks[idx];
            }
        });
    }
    else {

        $scope.selectedNetwork = $scope.networks[0];
    }
    $scope.loadDataOnChangeNetworkInProgress = false;

    $scope.onChangeNetwork = function() {
    	$scope.loadDataOnChangeNetworkInProgress = true;
        DataService
            .Users
            .setActiveNetwork($scope.selectedNetwork.name)
            .then(function(user) {
                if(user){
                    user.accessibleNetworks = mvIdentity.currentUser.accessibleNetworks;
                    mvIdentity.currentUser = user;
                }

                $location.path('/cc/home/new');
                $route.reload(); // Force reload
            })
            .catch(function(err) {

                NotifierService.notifyError('Failed to change network.');
            });
    }

    $scope.countsPoller = CICountsPollerService.create();

    $scope.countsPoller
        .promise
        .then(null,null,function(counts) {        	
        	if(counts && counts.network){
        		// If network is changed in a different tab/ session, update in the current window
        		if($scope.selectedNetwork.name !== counts.network && !$scope.loadDataOnChangeNetworkInProgress){
        		    if (mvIdentity.currentUser.affiliation.metadata &&
        		            mvIdentity.currentUser.affiliation.metadata.active_network) {
        		    	mvIdentity.currentUser.affiliation.metadata.active_network = counts.network;
        		    }
        			
        			$scope.selectedNetwork = { name: counts.network, value: counts.network};
        		}
        	}
            $scope.counts = counts;
        });

    $scope.stopPoller = function() {
        $scope.countsPoller.stop();
    };

    $scope.restartPoller = function() {
        $scope.countsPoller.restart();
    };

    $scope.GotoUserProfile = function(){
        $location.path('/profile');
    };


    // <editor-fold desc="Save & Delete Searches">
    $scope.GotoLibrary = function ($event, searchId) {
        //$log.debug('Go to Library: ' + searchId);
        var _path = '/cc/home/library' + '/' + searchId;

        if($location.path() === _path) {
            //this means user clicked on the same save search link again for reload!
            $route.reload(); // Force reload
        } else {
            $location.path(_path);
        }
    };

    $scope.onDeleteSearchClick = function($event, search) {
        var payload = {
            'searchName': search.name,
            'searchId': search.search_id
        };

        $event.preventDefault();
        $event.stopPropagation();

        var deleteSearchModalInstance = $modal.open({
            templateUrl: 'DELETE_SEARCH_MODAL',
            controller: 'DeleteSearchCtrl',
            windowClass: 'delete-search',
            backdrop: 'static',
            resolve: {
                payload: function () {
                    return payload;
                }
            }
        });

        deleteSearchModalInstance.result.then(function (searchName) {

            $log.debug('Delete Search Modal closed at: ' + moment().format('h:mm:ss a') + ', ' + searchName);

        }, function (reason) {

            $log.debug('Delete Search Modal dismissed at: ' + moment().format('h:mm:ss a'));

        });
    };
    //// </editor-fold>

    $scope.$on('owner-select', function (event, done) {
        //console.log('CopyCoordinatorLeftNavCtrl owner-select...');
        //recreate the poller, this will update the counts
        $scope.countsPoller = CICountsPollerService.create();
    });
};

angular
    .module('trafficbridge.cc')
    .controller('CopyCoordinatorLeftNavCtrl', [
        '$scope',
        '$route',
        '$location',
        '$log',
        'mvIdentity',
        'DataService',
        'CICountsPollerService',
        'NotifierService',
        'AuthService',
        '$modal',
        CopyCoordinatorLeftNavCtrl
    ]);
//
