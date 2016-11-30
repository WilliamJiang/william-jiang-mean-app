var tbadmin = angular.module('tbadmin');

tbadmin.controller('advTypeCtrl',
    ['$scope', '$stateParams', '$state',
        function ($scope, $stateParams, $state) {
            'use strict';

            $scope.title = 'Adv Types';

            $scope.advTypesData = [
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