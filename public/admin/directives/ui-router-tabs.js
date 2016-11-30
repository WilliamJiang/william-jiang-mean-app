angular.module('ui.router.tabs', []);
angular.module('ui.router.tabs').directive(
    'tabs', ['$rootScope', '$state', function($rootScope, $state) {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                tabs: '=data',
                type: '@',
                justified: '@',
                vertical: '@'
            },
            link: function(scope) {

                var updateTabs = function() {
                    scope.update_tabs();
                };

                var unbindStateChangeSuccess = $rootScope.$on('$stateChangeSuccess', updateTabs);
                var unbindStateChangeError = $rootScope.$on('$stateChangeError', updateTabs);
                var unbindStateChangeCancel = $rootScope.$on('$stateChangeCancel', updateTabs);
                var unbindStateNotFound = $rootScope.$on('$stateNotFound', updateTabs);

                scope.$on('$destroy', unbindStateChangeSuccess);
                scope.$on('$destroy', unbindStateChangeError);
                scope.$on('$destroy', unbindStateChangeCancel);
                scope.$on('$destroy', unbindStateNotFound);
            },
            controller: ['$scope', function($scope) {

                var currentStateEqualTo = function(tab) {

                    var isEqual = $state.is(tab.route, tab.params, tab.options);
                    return isEqual;
                };

                $scope.go = function(tab) {

                    if (!currentStateEqualTo(tab) && !tab.disabled) {
                        $state.go(tab.route, tab.params, tab.options);
                    }
                };

                /* whether to highlight given route as part of the current state */
                $scope.active = function(tab) {

                    var isAncestorOfCurrentRoute = $state.includes(tab.route, tab.params, tab.options);
                    return isAncestorOfCurrentRoute;
                };

                $scope.update_tabs = function() {

                    // sets which tab is active (used for highlighting)
                    angular.forEach($scope.tabs, function(tab) {
                        tab.params = tab.params || {};
                        tab.options = tab.options || {};
                        tab.active = $scope.active(tab);
                    });
                };

                // this always selects the first tab currently - fixed in ui-bootstrap master but not yet released
                // see https://github.com/angular-ui/bootstrap/commit/91b5fb62eedbb600d6a6abe32376846f327a903d
                $scope.update_tabs();
            }],
            templateUrl: function(element, attributes) {
                return attributes.templateUrl || 'ui-router-tabs-default-template.html';
            }
        };
    }]
).run(
    ['$templateCache', function($templateCache) {
        var DEFAULT_TEMPLATE = [
            '<div>',
            '<tabset class="tab-container" type="{{type}}" vertical="{{vertical}}" justified="{{justified}}">',
            '<tab class="tab" ng-repeat="tab in tabs" heading="{{tab.heading}}" active="tab.active" disable="tab.disabled" ng-click="go(tab)">',
            //'<tab-heading><i class="fa {{tab.options.icon}}"></i></tab-heading>',
            '</tab>',
            '</tabset>',
            '</div>'].join(' ');

        $templateCache.put('ui-router-tabs-default-template.html', DEFAULT_TEMPLATE);
    }]
);
//william TODO: {{tab.params.company}}