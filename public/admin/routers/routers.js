'use strict';

angular.module('tbadmin').config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        var checkLoggedin = function ($q, $timeout, $http, $location) {
            return true;
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function (user) {
                // Authenticated
                if (user !== '0') $timeout(deferred.resolve);
                else {
                    $timeout(deferred.reject);

                    NotifierService.notifyError('Not Authenticated');

                    $location.url('/login');
                }
            });

            return deferred.promise;
        };

        // For any unmatched url, redirect to /login
        $urlRouterProvider
            .when('/', '/login')
            .otherwise("/login");

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: '/admin/login/index',
                controller: 'LoginCtrl'
            });

        $stateProvider
            .state('admin', {
                url: '/admin',
                templateUrl: '/admin/views/menu'
            });

        // 1. Users
        $stateProvider
            .state('admin.list_users', {
                url: '/users',
                templateUrl: '/admin/views/list_users',
                controller: 'adminUsersListCtrl',
                resolve: {
                    usersList: ['DataService', function (DataService) {
                        return DataService.Users.getAllUsers();
                    }],
                    companiesList: ['DataService', function (DataService) {
                        return DataService.MediaCompanies.getAllCompanies();
                    }],
                    groupsList: ['DataService', function (DataService) {
                        return DataService.Groups.getAllGroups();
                    }]
                }
            })
            .state('admin.list_users.addUser', {
                url: '/user/add',
                resolve: {
                    loggedin: checkLoggedin
                },
                data: {
                    bNewUser: true //to determine if this user is new!
                },
                onEnter: ['$stateParams', '$state', '$modal', '$resource', function ($stateParams, $state, $modal, $resource) {

                    $modal.open({
                        templateUrl: "/admin/views/user",
                        backdrop: 'static',
                        size: 'lg',
                        //windowClass: 'userModal',
                        resolve: {
                            /*bCreateUser: function () {
                             return true;
                             },*/
                            currentUser: ['Restangular', function (Restangular) {
                                //create a new user object
                                var _data = {
                                    affiliation: {},
                                    roles: [],
                                    start_date: moment().startOf('day').toDate()
                                };
                                var newUser = Restangular.restangularizeElement(null, _data, 'users');

                                angular.extend(newUser, _data);
                                //newUser.affiliation = {};
                                //newUser.roles = [];

                                return newUser;
                            }],
                            companiesList: ['DataService', function (DataService) {
                                return DataService.MediaCompanies.getAllCompanies();
                            }],
                            groupsList: ['DataService', function (DataService) {
                                return DataService.Groups.getAllGroups();
                            }]
                        },
                        controller: 'adminUserCtrl'
                    })
                        .result.then(function (user) {
                            //this is close after save
                            console.log('close add');
                            $state.go('admin.list_users', null, {reload: true});
                        }, function (reason) {
                            //this is cancel button click/esc key press
                            $state.go('admin.list_users');
                        });
                }]
            })
            .state('admin.list_users.editUser', {
                url: '/user/edit/:uid',
                resolve: {
                    loggedin: checkLoggedin
                },
                data: {
                    bNewUser: false  //to determine if this user is new!
                },
                onEnter: ['$stateParams', '$state', '$modal', '$resource', function ($stateParams, $state, $modal, $resource) {
                    //event.preventDefault();
                    var _userId = $stateParams.uid;
                    $modal.open({
                        templateUrl: "/admin/views/user",
                        backdrop: 'static',
                        size: 'lg',
                        //windowClass: 'userModal',
                        resolve: {
                            /*bCreateUser: function () {
                             return false;
                             },*/
                            currentUser: ['DataService', function (DataService) {
                                return DataService.Users.getUser(_userId);
                            }],
                            companiesList: ['DataService', function (DataService) {
                                return DataService.MediaCompanies.getAllCompanies();
                            }],
                            groupsList: ['DataService', function (DataService) {
                                return DataService.Groups.getAllGroups();
                            }]
                        },
                        controller: 'adminUserCtrl'
                    })
                        .result.then(function (user) {
                            //this is close after save
                            console.log('close edit');
                            $state.go('admin.list_users', null, {reload: true});
                        }, function (reason) {
                            //this is cancel button click/esc key press
                            $state.go('admin.list_users');
                        });
                    /*
                     .result
                     .finally(function () {
                     $state.go('admin.list_users', null, {reload: true});
                     });*/
                }]
            });

        // 2. Groups
        $stateProvider
            .state('admin.list_groups', {
                url: '/groups',
                templateUrl: '/admin/views/list_groups',
                controller: 'groupsListCtrl',
                resolve: {
                    groupsList: function (DataService) {
                        return DataService.Groups.getAllGroups();
                    },
                    //william TODO: create a factory to cache.
                    companiesList: function (DataService) {
                        return DataService.MediaCompanies.getAllCompanies();
                    }
                }
            })
            .state('admin.list_groups.addGroup', {
                url: '/group/add',
                resolve: {
                    loggedin: checkLoggedin
                },
                data: {
                    bNewGroup: true
                },
                onEnter: [
                    '$stateParams', '$state', '$modal', '$resource', function ($stateParams, $state, $modal, $resource) {

                        $modal.open({
                            templateUrl: '/admin/views/group',
                            backdrop: 'static',
                            size: 'lg',
                            controller: 'groupCtrl',
                            resolve: {
                                groupsList: function (DataService) {
                                    return DataService.Groups.getAllGroups();
                                },
                                currentGroup: function () {
                                    return {};
                                },
                                companiesList: function (DataService) {
                                    return DataService.MediaCompanies.getAllCompanies();
                                }
                            }
                        })
                            .result.then(function (group) {
                                console.log('add: ', group);
                                $state.go('admin.list_groups', null, {reload: true});
                            }, function (reason) {
                                $state.go('admin.list_groups');
                            });
                        return false;
                    }
                ]
            })
            .state('admin.list_groups.editGroup', {
                url: '/group/edit/:gid',
                resolve: {
                    loggedin: checkLoggedin
                },
                data: {
                    bNewGroup: false
                },
                onEnter: [
                    '$stateParams', '$state', '$modal', '$resource', function ($stateParams, $state, $modal, $resource) {
                        //event.preventDefault();
                        var gId = $stateParams.gid;
                        $modal.open({
                            templateUrl: '/admin/views/group',
                            backdrop: 'static',
                            size: 'lg',
                            controller: 'groupCtrl',
                            resolve: {
                                currentGroup: function (DataService) {
                                    return DataService.Groups.getGroupById(gId);
                                },
                                groupsList: function (DataService) {
                                    return DataService.Groups.getAllGroups();
                                },
                                companiesList: function (DataService) {
                                    return DataService.MediaCompanies.getAllCompanies();
                                }
                            }
                        })
                            .result.then(function (group) {
                                console.log('edit: ', group);
                                $state.go('admin.list_groups', null, {reload: true});
                                //$state.transitionTo('admin.list_groups', null, {
                                //    reload: true,
                                //    inherit: true,
                                //    notify: true
                                //});
                                // window.location.href='admin.list_groups';
                            }, function (reason) {
                                $state.go('admin.list_groups');
                            });
                        return false;
                    }
                ]
            })

        // 3. Companies
        $stateProvider
            .state('admin.list_companies', {
                url: '/companies',
                templateUrl: '/admin/views/list_companies'
            })
            .state('admin.list_companies.addCompany', {
                url: '/company/add',
                templateUrl: '/admin/views/company',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.list_companies.editCompany', {
                url: '/company/edit/:cid',
                templateUrl: '/admin/views/company',
                resolve: {
                    loggedin: checkLoggedin
                }
            });


        // 4. Networks
        $stateProvider
            .state('admin.list_networks', {
                url: '/networks',
                templateUrl: '/admin/views/list_networks'
            })
            .state('admin.list_networks.addNetwork', {
                url: '/network/add',
                templateUrl: '/admin/views/network',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.list_networks.editNetwork', {
                url: '/network/edit/:nid',
                templateUrl: '/admin/views/network',
                resolve: {
                    loggedin: checkLoggedin
                }
            });

        // 5. Advertisers
        $stateProvider
            .state('admin.list_advertisers', {
                url: '/advertisers',
                templateUrl: '/admin/views/list_advertisers'
            })
            .state('admin.list_advertisers.addAdvertiser', {
                url: '/advertiser/add',
                templateUrl: '/admin/views/advertiser',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.list_advertisers.editAdvertiser', {
                url: '/advertiser/edit/:aid',
                templateUrl: '/admin/views/advertiser',
                resolve: {
                    loggedin: checkLoggedin
                }
            });

        // 8. Adv Types
        $stateProvider
            .state('admin.list_advtypes', {
                url: '/advtypes',
                templateUrl: '/admin/views/list_advtypes'
            })
            .state('admin.list_advtypes.addAdvtype', {
                url: '/advtype/add',
                templateUrl: '/admin/views/advtype',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.list_advtypes.editAdvtype', {
                url: '/advtype/edit/:aid',
                templateUrl: '/admin/views/advtype',
                resolve: {
                    loggedin: checkLoggedin
                }
            });

        // 6. Brands
        $stateProvider
            .state('admin.list_brands', {
                url: '/brands',
                templateUrl: '/admin/views/list_brands'
            })
            .state('admin.list_brands.addBrand', {
                url: '/brand/add',
                templateUrl: '/admin/views/brand',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.list_brands.editBrand', {
                url: '/brand/edit/:bid',
                templateUrl: '/admin/views/brand',
                resolve: {
                    loggedin: checkLoggedin
                }
            });

        // 7. Selling Titles
        $stateProvider
            .state('admin.list_programs', {
                url: '/programs',
                templateUrl: '/admin/views/list_programs'
            })
            .state('admin.list_programs.addProgram', {
                url: '/program/add',
                templateUrl: '/admin/views/program',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.list_programs.editProgram', {
                url: '/program/edit/:pid',
                templateUrl: '/admin/views/program',
                resolve: {
                    loggedin: checkLoggedin
                }
            });

        // william TODO: make role and username display on top-right correctly.
        $stateProvider.state('loginInfo', {
            url: '/loginInfo',
            view: {
                'loginInfo': {
                    templateUrl: '/admin/views/login_info',
                    controller: 'adminCtrl'
                }
            }
        })
    }
]);
