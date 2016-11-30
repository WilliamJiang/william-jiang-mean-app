function MainCtrl($scope,
                  $location,
                  mvIdentity) {

    $scope.identity = mvIdentity;

    if (mvIdentity.currentUser) {
        var _path = '/cc/home/new'; //default path

        //Pivotal Bug# 92145296:
        //TODO: Pavani: may be we need to have a better logic here!
        switch (mvIdentity.currentUser.affiliation && mvIdentity.currentUser.affiliation.type) {
            case 'media_company':
                _path = '/cc/home/new';
                break;
            case 'agency':
                _path = '/tc/home/new';
                break;
        }

        $location.path(_path);
    }
    else {
        $location.path('/login');
    }
}

angular
    .module('trafficbridge.main')
    .controller('MainCtrl', [
        '$scope',
        '$location',
        'mvIdentity',
        MainCtrl]);
