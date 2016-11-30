var tbcc = angular.module('trafficbridge.cc');

/**
 * using $templateCache is better performance than ajax-call templateUrl from a folder.
 * if $scope.scale isn't defined, it will up-cast to use parent controller's scale.
 */
tbcc.directive('zoomInOut', ["$timeout", function ($timeout) {
    "use strict";

    return {
        templateUrl: "zoom_directive.htm",
        restrict: "EA",
        replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

            angular.extend(
                $scope, {
                    scale: 1.25,
                    scaleUnit: 1.25,
                    rotateUnit: 90,
                    rotate: 0,
                    zoomInOutOfRange: false,
                    zoomOutOutOfRange: false,
                    zoomProcessing: false,
                    scaleMin: function (min) {
                        return min ? min : 0.2;
                    },
                    scaleMax: function (max) {
                        return max ? max : 6.0;
                    }
                });

            $scope.onZoomIn = function () {

                if ($scope.$parent.scale && $scope.$parent.scale !== 999) {
                    $scope.scale = $scope.$parent.scale;
                }

                $scope.zoomProcessing = true;
                if ($scope.scale < $scope.scaleMax()) {
                    $scope.zoomInOutOfRange = false;
                    $scope.scale = $scope.scale * $scope.scaleUnit;
                    if ($scope.scale >= $scope.scaleMax()) {
                        $scope.zoomInOutOfRange = true;
                    }
                    if ($scope.zoomOutOutOfRange) {
                        $scope.zoomOutOutOfRange = false;
                    }
                }
                else {
                    $scope.zoomInOutOfRange = true;
                }
                $scope.$parent.scale = $scope.scale;

                //$scope.$parent.renderPage();
                $scope.renderPage($scope.PDFDOC ? $scope.PDFDOC.pageNum : $scope.pageNum);
            };

            $scope.onZoomOut = function () {

                if ($scope.$parent.scale && $scope.$parent.scale !== 999) {
                    $scope.scale = $scope.$parent.scale;
                }

                $scope.zoomProcessing = true;
                if ($scope.scale > $scope.scaleMin()) {
                    $scope.zoomOutOutOfRange = false;
                    $scope.scale = $scope.scale / $scope.scaleUnit;
                    if ($scope.scale <= $scope.scaleMin()) {
                        $scope.zoomOutOutOfRange = true;
                    }
                    if ($scope.zoomInOutOfRange) {
                        $scope.zoomInOutOfRange = false;
                    }
                }
                else {
                    $scope.zoomOutOutOfRange = true;
                }
                $scope.$parent.scale = $scope.scale;

                $scope.renderPage($scope.PDFDOC ? $scope.PDFDOC.pageNum : $scope.pageNum);

            };

            $scope.onRotate = function () {
                //Get the CI to Rotate into a local variable and
                // reuse it, get rid of all the nasty code!
                var _ciToRotate;

                //1. determine current rotation
                if ($scope.IS_FILING_SCREEN) {
                    //Filing Screen
                    _ciToRotate = $scope.ci;
                }
                else if ($scope.IS_CI_DETAILS_SCREEN) {
                    //CI Details Screen
                    _ciToRotate = $scope.active_ci;
                }
                else if ($scope.$parent.IS_COMPARE_SCREEN) {
                    //Compare Revisions Screen
                    if ($scope.PDFDOC.isPossibleCandidate) {
                        //RIGHT
                        if ($scope.$parent.selectedCandidateStaple) {
                            _ciToRotate = $scope.$parent.selectedCandidateStaple;
                        } else {
                            _ciToRotate = $scope.$parent.selectedCandidateCI;
                        }

                    } else {
                        //LEFT
                        _ciToRotate = $scope.$parent.selectedCI;
                    }
                } else {
                    //fallback
                    _ciToRotate = $scope.ci;
                }
                //now that we have the ci, get the rotation from it
                $scope.rotate = _ciToRotate.rotation;

                //2. calculate new rotation
                if ($scope.rotate < 270) {
                    $scope.rotate += $scope.rotateUnit;
                }
                else {
                    $scope.rotate = 0;
                }

                //3. update the new rotation to scope CI
                _ciToRotate.rotation = $scope.rotate;

                //4. render page with new rotation
                $scope.renderPage($scope.PDFDOC ? $scope.PDFDOC.pageNum : $scope.pageNum);

                //4. save new rotation to DB
                setTimeout(function () {
                    var _ci = _ciToRotate;
                    if ($scope.IS_FILING_SCREEN) {
                        //Filing Screen
                        //new rotation is saved on 'Save' button click
                    }
                    else if ($scope.IS_CI_DETAILS_SCREEN) {
                        if (typeof  $scope.onChangeRotation === 'function') {
                            $scope.onChangeRotation($scope.rotate, _ci, false);
                        }
                    }
                    else if ($scope.$parent.IS_COMPARE_SCREEN) {
                        if (typeof  $scope.$parent.onChangeRotation === 'function') {
                            $scope.$parent.onChangeRotation($scope.rotate, _ci, false);
                        }
                    }
                }, 200);
            };

            /**
             * wait for 1 seconds, then activate the zoom button.
             */
            $scope.$on('zoom-processing', function (event, done) {

                if ($scope.zoomProcessing) {
                    if (done === 'done') {
                        $timeout(function () {
                            $scope.zoomProcessing = false;
                        }, 1000);
                    }
                    else {
                        //try-catch-finally, backdoor: exception, still allow zooming.
                        $timeout(function () {
                            $scope.zoomProcessing = false;
                        }, 2000);
                    }
                }
            });
        }],
        link: function (scope, element, attrs) {

            scope.onZoomFit = function () {

                //if (scope.$parent.scale && scope.$parent.scale !== 999) {
                //    scope.scale = scope.$parent.scale;
                //}
                scope.zoomProcessing = true;

                scope.$parent.scale = scope.scale = 999;
                scope.rotate = 0;
                scope.rotateUnit = 90;

                scope.renderPage(scope.PDFDOC ? scope.PDFDOC.pageNum : scope.pageNum);

                return false;
            }
        }
    }
}])
    .run(['$templateCache', function ($templateCache) {
        var template = [
            '<div class="group-btn-zoom">',
            '   <div class="group-btn-zoom-wrapper">',
            '   <div class="zoom-out">',
            '    <a id="zoom_out" title="{{scale | percentage: 0}}" href="javascript:void(0);" ng-click="onZoomOut()" class="buttons-zoom-out" ng-class="{\'disabled\':zoomOutOutOfRange || zoomProcessing}"><span class="icon-tpIcons02-11"></span></a>',
            '   </div>',
            '   <div class="line"></div>',
            '   <div class="zoom-in">',
            '    <a id="zoom_in" title="{{scale | percentage: 0}}" href="javascript:void(0)"  ng-click="onZoomIn()"  class="buttons-zoom-in"  ng-class="{\'disabled\':zoomInOutOfRange || zoomProcessing}"><span class="icon-tpIcons02-10"></span></a>',
            '   </div>',
            '    <a id="zoom_fit" title="Fit window size" href="javascript:void(0)" ng-click="onZoomFit();" class="buttons-fit"><span class="icon-tpIcons02-08"></span></a>',
            '    <a href="javascript:void(0)" title="Rotate CI" ng-click="onRotate()" ng-hide="disableRotation" class="buttons-unchecked"><span class="icon-TBicons4-02"></span></a>',
            '   </div>',
            '</div>'
        ].join(' ');

        $templateCache.put("zoom_directive.htm", template);
    }]);


tbcc.filter('percentage', ['$filter', function ($filter) {
    return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
    };
}]);