var tbadmin = angular.module('tbadmin');

tbadmin.controller('adminCtrl', ['$scope', '$rootScope', '$location', '$state', 'mvIdentity', 'NotifierService', 'AuthService',
    function ($scope, $rootScope, $location, $state, mvIdentity, NotifierService, AuthService) {
        'use strict';

        $rootScope.$on('login-display', function () {
            if (!$scope.userInfo) {

                $scope.userInfo = mvIdentity.getUser();
            }
        });

        $scope.signout = function () {
            AuthService.logoutUser()
                .then(function () {

                    mvIdentity.setUser();
                    NotifierService.notifySuccess('You signed out successfully!');
                    $location.path('/login');
                });
        };

        if (!$scope.userInfo) {

            $scope.userInfo = mvIdentity.getUser();
        }

        //Object {url: "/admin", templateUrl: "/admin/views/menu", name: "admin"}
        if ($state.current.name === 'admin') {
            $state.go('admin.list_companies');
        }
        else {
            //$state.reload();
            $state.go($state.current.name);
        }

    }]);