var tbadmin = angular.module('tbadmin');

tbadmin.controller('menuCtrl', ['$scope', '$state',
    function ($scope, $state) {
        'use strict';

        //crud permission.
        $scope.tabData = [
            {
                heading: 'Companies',
                route: 'admin.list_companies',
                params: {
                    tb: [1, 1, 1, 1],
                    super: [0, 0, 0, 0],
                    company: [0, 0, 0, 0]
                }
            },
            {
                heading: 'Groups',
                route: 'admin.list_groups',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                }
            },
            {
                heading: 'Users',
                route: 'admin.list_users',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                }
            },
            {
                heading: 'Networks',
                route: 'admin.list_networks',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                }
            },
            {
                heading: 'Advertisers',
                route: 'admin.list_advertisers',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                }
            },
            {
                heading: 'Adv Types',
                route: 'admin.list_advtypes',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                }
            },
            {
                heading: 'Brands',
                route: 'admin.list_brands',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                }
            },
            {
                heading: 'Selling Titles',
                route: 'admin.list_programs',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                }
            }
        ];

        $scope.initAdmin = function () {
            $state.go('admin.list_users');
        };

    }]);
  