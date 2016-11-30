var tbadmin = angular.module('tbadmin');

tbadmin.controller('advertiserCtrl',
    ['$scope', '$stateParams', '$state',
        function ($scope, $stateParams, $state) {
            'use strict';

            $scope.title = 'Advertiser';

            $scope.advertisersData = [
                {
                    "firstName": "Cox" + $scope.title,
                    "lastName": "Carney",
                    "company": "Enormo",
                    "employed": true
                },
                {
                    "firstName": "Lorraine",
                    "lastName": "Wise",
                    "company": "Comveyer",
                    "employed": false
                },
                {
                    "firstName": "Nancy",
                    "lastName": "Waters",
                    "company": "Fuelton",
                    "employed": false
                }
            ]
        }]);