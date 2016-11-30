var tbadmin = angular.module('tbadmin');

tbadmin.controller('menuCtrl', ['$scope', '$state', '$state',
    function ($scope, $state, $state) {

        //crud permission.
        $scope.tabData = [
            {
                heading: 'Companies',
                route: 'admin.list_companies',
                params: {
                    tb: [1, 1, 1, 1],
                    super: [0, 0, 0, 0],
                    company: [0, 0, 0, 0]
                },
                options: {
                    icon: 'fa-connectdevelop'
                }
            },
            {
                heading: 'Groups',
                route: 'admin.list_groups',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                },
                options: {
                    icon: 'fa-group'
                }
            },
            {
                heading: 'Users',
                route: 'admin.list_users',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                },
                options: {
                    icon: 'fa-users'
                }
            },
            {
                heading: 'Networks',
                route: 'admin.list_networks',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                },
                options: {
                    icon: 'fa-user-plus'
                }
            },
            {
                heading: 'Advertisers',
                route: 'admin.list_advertisers',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                },
                options: {
                    icon: 'fa-buysellads'
                }
            },
            {
                heading: 'Adv Types',
                route: 'admin.list_advtypes',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                },
                options: {
                    icon: 'fa-diamond'
                }
            },
            {
                heading: 'Brands',
                route: 'admin.list_brands',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                },
                options: {
                    icon: 'fa-mars-double'
                }
            },
            {
                heading: 'Selling Titles',
                route: 'admin.list_programs',
                params: {
                    tb: [0, 0, 0, 1],
                    super: [1, 1, 1, 1],
                    company: [1, 1, 1, 1]
                },
                options: {
                    icon: 'fa-forumbee'
                }
            }
        ];

        $scope.initAdmin = function () {
            $state.go('admin.list_users');
        };

    }]);
  