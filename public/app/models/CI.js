angular
    .module('app')
    .factory('CI', ['Restangular', function (Restangular) {
        return Restangular.service('ci');
    }]);
