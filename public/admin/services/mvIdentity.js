function mvIdentity($window,
                    Restangular) {

    "use strict";
    var _currentUser;

    if (!!$window.bootstrappedUserObject) {

        var user = Restangular.restangularizeElement(null, $window.bootstrappedUserObject, 'users');
        _currentUser = user;
    }

    return {
        currentUser: _currentUser,
        isAuthenticated: function () {
            return !!this.currentUser;
        },
        isAuthorized: function (roles) {

            // TODO revisit... kenmc
            if (roles === '*') {
                return true;
            }

            if (!this.isAuthenticated()) {
                return false;
            }

            if (!angular.isArray(roles)) {
                roles = [roles];
            }
            return this.isAuthenticated() && _.intersection(this.currentUser.roles, roles).length > 0;
        },
        //william added:
        setUser: function (user) {

            _currentUser = user;
            if (user) {
                localStorage.setItem('userInfo', JSON.stringify(user));
            }
            else {
                localStorage.removeItem('userInfo');
            }
        },
        getUser: function () {
            return _currentUser ? _currentUser : JSON.parse(localStorage.getItem('userInfo'));
        }
    }
}

angular
    .module('tbadmin')
    .factory('mvIdentity', [
        '$window',
        'Restangular',
        mvIdentity
    ]);
