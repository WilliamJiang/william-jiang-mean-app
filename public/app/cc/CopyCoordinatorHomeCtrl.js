function CopyCoordinatorHomeCtrl($scope,
                                 $log) {

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
}

angular
    .module('trafficbridge.cc')
    .controller('CopyCoordinatorHomeCtrl', [
        '$scope',
        '$log',
        CopyCoordinatorHomeCtrl
    ]);
