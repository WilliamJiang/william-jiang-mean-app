function AuthService($http,
                     $q,
                     mvIdentity,
                     Restangular) {
    "use strict";
    /**
     * william jiang.
     */
    var _authUser = {};

    return {

        authenticateUser: function (username, password) {
            var dfd = $q.defer();

            //before send, username and password need to process to avoid hack.

            $http.post('/login',
                {
                    username: username,
                    password: password
                })
                .then(function (response) {

                    if (response.data.success) {

                        var _user = response.data.user;

                        var user = Restangular.restangularizeElement(null, response.data.user, 'users')
                        mvIdentity.currentUser = user;

                        //william:
                        mvIdentity.setUser(user);

                        dfd.resolve(response);
                    }
                    else {

                        dfd.resolve(response);
                    }
                });

            return dfd.promise;
        },

        logoutUser: function () {

            var dfd = $q.defer();

            $http.post('/logout',
                {
                    logout: true
                })
                .then(function () {

                    mvIdentity.currentUser = undefined;
                    dfd.resolve(true);
                });

            return dfd.promise;
        },

        isAuthorized: function (roles) {

            return mvIdentity.isAuthorized(roles);
        },

        isAuthenticated: function () {

            return mvIdentity.isAuthenticated();
        },

        requestForCredentials: function (credential, data) {
            var dfd = $q.defer();

            $http.post('/forgot/' + credential, data)
                .then(function (response) {
                    dfd.resolve(response);
                });

            return dfd.promise;
        },

        createUser: function (newUserData) {

            var newUser = Restangular.restangularizeElement(null, newUserData, 'users')

            var dfd = $q.defer();

            //$ methods are for resources
            newUser
                .save()
                .then(function (createdUser) {
                    mvIdentity.currentUser = createdUser;
                    dfd.resolve(true);
                })
                .catch(function (response) {
                    dfd.reject(response.data.reason);
                });

            return dfd.promise;
        },

        updateUser: function (userData) {

            var dfd = $q.defer();

            //var cloneUser = angular.copy(mvIdentity.currentUser);

            //var cloneUser = Restangular.copy(mvIdentity.currentUser);
            //_.extend(cloneUser,userData);

            // HACK fix - kenmc
            userData._id = mvIdentity.currentUser._id;

            Restangular
                .all('users')
                .customPUT(userData)
                //cloneUser
                //.save()
                .then(function (updatedUser) {
                    mvIdentity.currentUser = updatedUser;//cloneUser;
                    dfd.resolve(true);
                },
                function (response) {
                    dfd.reject(response.data.reason);
                });

            return dfd.promise;
        }
    }
}

angular
    .module('app')
    .factory('AuthService', [
        '$http',
        '$q',
        'mvIdentity',
        'Restangular',
        AuthService
    ]);
