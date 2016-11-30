function ProfileCtrl($scope,
                     $location,
                     AuthService,
                     mvIdentity,
                     NotifierService) {

    $scope.email = mvIdentity.currentUser.userName;
    $scope.fname = mvIdentity.currentUser.firstName;
    $scope.lname = mvIdentity.currentUser.lastName;
    $scope.start_date = mvIdentity.currentUser.start_date;
    $scope.end_date = mvIdentity.currentUser.end_date;

    $scope.update = function () {

        var userData = {
            userName: $scope.email,
            firstName: $scope.fname,
            lastName: $scope.lname
        };

        //update password only if it is entered!
        if ($scope.password && $scope.password.length > 0) {
            userData.password = $scope.password;
        }

        AuthService
            .updateUser(userData)
            .then(function () {
                NotifierService.notifySuccess('User profile information is updated!');
                $location.path('/cc/home/new');
            },
            function (reason) {
                NotifierService.notifyError(reason);
            });
    }
}

angular
    .module('trafficbridge.profile')
    .controller('ProfileCtrl', [
        '$scope',
        '$location',
        'AuthService',
        'mvIdentity',
        'NotifierService',
        ProfileCtrl]);
