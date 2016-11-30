function DebugCtrl($scope,
                   mvIdentity) {

    $scope.currentUser = mvIdentity.currentUser;
}

angular
    .module('trafficbridge.main')
    .controller('DebugCtrl', ['$scope', DebugCtrl]);
