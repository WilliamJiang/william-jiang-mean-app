var tbadmin = angular.module('tbadmin');

tbadmin.directive('formDirective', [function () {
    'use strict';

    return {
        templateUrl: 'form_directive.htm',
        restrict: 'EA',
        replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

        }],
        link: function ($scope, element, attrs) {

        }
    }

}]).run(['$templateCache', function ($templateCache) {

    var template = [].join(' ');

    $templateCache.put('form_directive.htm', template);

}]);

var injectParams = ['$q', '$parse', 'dataService'];

var wcUniqueDirective = function($q, $parse, dataService) {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            var deferred = $q.defer(),
                currentValue = modelValue || viewValue,
                key = attrs.wcUniqueKey,
                property = attrs.wcUniqueProperty;

            if (key && property) {
                dataService.checkUniqueValue(key, property, currentValue)
                    .then(function (unique) {
                        if (unique) {
                            deferred.resolve(); //It's unique
                        }
                        else {
                            deferred.reject(); //Add unique to $errors
                        }
                    });
            }
            else {
                deferred.resolve(); //Ensure promise is resolved if we hit this
            }

            return deferred.promise;
        }
    }
};

wcUniqueDirective.$inject = injectParams;

angular.module('tbadmin').directive('wcUnique', wcUniqueDirective);