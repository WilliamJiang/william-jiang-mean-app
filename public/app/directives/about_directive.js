/**
 * William: general purpose simple modal usage.
 * angular ui.bootstrap.modal seems
 * refer to: http://jsfiddle.net/alexsuch/RLQhh/, https://angular-ui.github.io/bootstrap/#/modal
 */

var app = angular.module('trafficbridge.login');

app.directive('simpleModal', function () {
    return {
        template: ['<div class="modal fade">',
            '<div class="modal-dialog">',
            ' <div class="modal-content">',
            '  <div class="modal-header">',
            '   <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
            '   <h4 class="modal-title">{{ title }}</h4>',
            '  </div>',
            '  <div class="modal-body" ng-transclude></div>',
            ' </div>',
            '</div>',
            '</div>'
        ].join("\n"),
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: true,
        link: function postLink(scope, element, attrs) {
            scope.title = attrs.title;
            var $sModal = angular.element(element[0]);

            scope.$watch(attrs.visible, function (value) {
                if (value === true)
                    $sModal.modal('show');
                else
                    $sModal.modal('hide');
            });

            $sModal.on('shown.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = true;
                });
            });

            $sModal.on('hidden.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    }
});