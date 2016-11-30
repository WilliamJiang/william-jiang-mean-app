/**
 * Created by PavaniKa on 4/15/2015.
 */
var tbcc = angular.module('trafficbridge.cc');

tbcc.directive('pdfView', ["$timeout", "UtilsService", function ($timeout, UtilsService) {
    "use strict";

    return {
        templateUrl: "pdf_view_directive.htm",
        restrict: "EA",
        replace: true,
        //transclude: true,
        scope: {
            viewSide: '@viewSide', //attribute scope
            PDFDOC: '=pdfDoc' //parent scope
        },
        controller: ['$scope', function ($scope) {
            //console.log('pdfView controller...');

            //<editor-fold desc="PAGE Functions">
            $scope.onFirstPage = function () {
                //console.log('onFirstPage: ' + $scope.viewSide);
                if (!_.isNumber($scope.PDFDOC.pageNum)) {
                    return;
                }
                if ($scope.PDFDOC.pageNum <= 1) {
                    return;
                }
                $scope.PDFDOC.pageNum = 1;
                queueRenderPage($scope.PDFDOC.pageNum);
            };
            $scope.onPrevPage = function () {
                //console.log('onPrevPage: ' + $scope.viewSide);
                if (!_.isNumber($scope.PDFDOC.pageNum)) {
                    return;
                }
                if ($scope.PDFDOC.pageNum <= 1) {
                    return;
                }
                $scope.PDFDOC.pageNum--;
                queueRenderPage($scope.PDFDOC.pageNum);
            };
            $scope.GotoPage = function ($event) {
                //console.log('GotoPage: ' + $scope.viewSide);
                if (_.isNumber($scope.PDFDOC.pageNum)) {
                    if (!UtilsService.inRange($scope.PDFDOC.pageNum, 1, $scope.PDFDOC.pageCount)) {
                        $scope.PDFDOC.pageNum = $scope.PDFDOC.pageCount;
                    }
                } else {
                    //don't render if not a number
                    return;
                }

                queueRenderPage($scope.PDFDOC.pageNum);
            };
            $scope.onNextPage = function () {
                //console.log('onNextPage: ' + $scope.viewSide);
                if (!_.isNumber($scope.PDFDOC.pageNum)) {
                    return;
                }
                if ($scope.PDFDOC.pageNum >= $scope.PDFDOC.pageCount) {
                    return;
                }
                $scope.PDFDOC.pageNum++;
                queueRenderPage($scope.PDFDOC.pageNum);
            };
            $scope.onLastPage = function () {
                //console.log('onLastPage: ' + $scope.viewSide + ', ' + $scope.PDFDOC.hasEmail);
                if (!_.isNumber($scope.PDFDOC.pageNum)) {
                    return;
                }
                if ($scope.PDFDOC.pageNum >= $scope.PDFDOC.pageCount) {
                    return;
                }
                $scope.PDFDOC.pageNum = $scope.PDFDOC.pageCount;
                queueRenderPage($scope.PDFDOC.pageNum);
            };
            $scope.onViewEmailClick = function ($event) {
                //console.log('onViewEmailClick: ' + $scope.viewSide);
                $scope.PDFDOC.bShowEmail = !$scope.PDFDOC.bShowEmail;

                if($scope.PDFDOC.bShowEmail) {
                    //set email DIV height to pdf DIV's height
                    var pdfDiv = angular.element('.pdf-placeholder');
                    var emailDiv = angular.element('.email-placeholder');

                    if(emailDiv) {
                        emailDiv.height(pdfDiv.height());
                    }
                }
            };
            //</editor-fold>

            //<editor-fold desc="PDFJS Functions">
            $scope.scale = 999; //1.25;
            $scope.$canvas = angular.element("<canvas style='margin: 0 auto; display: block;'></canvas>");

            $scope.Load_PDF_Document = function () {

                PDFJS.disableWorker = true;
                var ingestUrl = $scope.PDFDOC.URL;

                var pid = ingestUrl.match(/(?:\/.*\/(.*:?))\.pdf/i)[1];
                var pdfURL = '/api/pdf/' + pid;

                if (pdfURL) {
                    //append canvas here, so we don't have to append it again!
                    $scope.pdfWrapperDiv.empty().append($scope.$canvas);
                    //UtilsService.showProgressBar('new_ci_modal_progress');
                    PDFJS
                        .getDocument(pdfURL)
                        .then(function (pdfDoc_) {
                            $scope.$apply(function () {
                                $scope.PDFDOC.pdfDoc = pdfDoc_;
                                $scope.PDFDOC.pageCount = $scope.PDFDOC.pdfDoc.numPages;
                            });
                            // Initial/first page rendering
                            renderPage($scope.PDFDOC.pageNum);
                        });

                } else {
                    //UtilsService.hideProgressBar('new_ci_modal_progress');
                    //TODO: show that URL is missing on the CI??
                }
            };
            function renderPage(num) {
                //$scope.ciId = $scope.ci._id;
                $scope.PDFDOC.pageRendering = true;

                // Using promise to fetch the page
                $scope.PDFDOC.pdfDoc.getPage(num)
                    .then(function (page) {
                        var wrapperWidth = $scope.pdfWrapperDiv.width();
                        var wrapperHeight = $scope.pdfWrapperDiv.height();

                        var bIsFirstLoad = $scope.scale == 999;

                        /**
                         * OPTION 1:
                         * this will take the min scale of both width & height
                         */
                        /*if($scope.scale === 999) {
                            var _scale1 = wrapperWidth / page.getViewport(1.0).width;
                            var _scale2 = wrapperHeight / page.getViewport(1.0).height;

                            if(_scale1 <= _scale2) {
                                $scope.scale = _scale1;
                            } else {
                                $scope.scale = _scale2;
                            }
                        }*/

                        //OPTION 2: this will set the scale based on width
                        $scope.scale = $scope.scale == 999 ? (wrapperWidth / page.getViewport(1.1).width) : $scope.scale;

                        var rot;
                        if ($scope.PDFDOC.isPossibleCandidate) {
                            //RIGHT
                            rot = $scope.$parent.selectedCandidateStaple ? $scope.$parent.selectedCandidateStaple.rotation : $scope.$parent.selectedCandidateCI.rotation;
                        } else {
                            //LEFT
                            rot = $scope.$parent.selectedCI.rotation;
                        }

                        var viewport = page.getViewport($scope.scale, rot);
                        var canvas = $scope.$canvas.get(0);
                        var context = canvas.getContext("2d");

                        //context.imageSmoothingEnabled = false;
                        //context.webkitImageSmoothingEnabled = false;
                        //context.mozImageSmoothingEnabled = false;

                        /*
                         * OPTION 1:
                         * if we take the min. of width, height approach we need to
                         * do this to get rid of the unnecessary scroll!
                         */
                        //canvas.height = viewport.height - 10;
                        //canvas.width = viewport.width;

                        //OPTION 2:
                        //viewport.width = bIsFirstLoad ? viewport.width - 25 : viewport.width; //subtract 25 for vertical scroll in default zoom/scale
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        page.getTextContent()
                            .then(function (textContent) {
                                var renderContext = {
                                    canvasContext: context,
                                    viewport: viewport
                                };

                                var renderTask = page.render(renderContext);
                                // Wait for rendering to finish
                                renderTask
                                    .then(function () {

                                        $scope.PDFDOC.pageRendering = false;

                                        if ($scope.PDFDOC.pageNumPending !== null) {
                                            // New page rendering is pending
                                            renderPage($scope.PDFDOC.pageNumPending);
                                            $scope.PDFDOC.pageNumPending = null;
                                        }
                                        //UtilsService.hideProgressBar('new_ci_modal_progress');
                                        //william: re-active 'zoom' button.
                                        $scope.$broadcast('zoom-processing', 'done');
                                    });
                            });
                    });
            }

            function queueRenderPage(num) {
                if ($scope.PDFDOC.pageRendering) {
                    $scope.PDFDOC.pageNumPending = num;
                }
                else {
                    renderPage(num);
                }
            }

            $scope.renderPage = renderPage.bind($scope);

            /**
             * this is to load the previous page of PDF
             */
            $scope.onPrevPage = function () {
                if (!_.isNumber($scope.PDFDOC.pageNum)) {
                    return;
                }
                if ($scope.PDFDOC.pageNum <= 1) {
                    return;
                }
                $scope.PDFDOC.pageNum--;
                queueRenderPage($scope.PDFDOC.pageNum);
            };
            /**
             * this is to load the next page of PDF
             */
            $scope.onNextPage = function () {
                if (!_.isNumber($scope.PDFDOC.pageNum)) {
                    return;
                }
                if ($scope.PDFDOC.pageNum >= $scope.PDFDOC.pageCount) {
                    return;
                }
                $scope.PDFDOC.pageNum++;
                queueRenderPage($scope.PDFDOC.pageNum);
            };
            /**
             * this is to load the first page of PDF
             */
            $scope.onFirstPage = function () {
                if (!_.isNumber($scope.PDFDOC.pageNum)) {
                    return;
                }
                if ($scope.PDFDOC.pageNum <= 1) {
                    return;
                }
                $scope.PDFDOC.pageNum = 1;
                queueRenderPage($scope.PDFDOC.pageNum);
            };
            /**
             * this is to load the last page of PDF
             */
            $scope.onLastPage = function () {
                if (!_.isNumber($scope.PDFDOC.pageNum)) {
                    return;
                }
                if ($scope.PDFDOC.pageNum >= $scope.PDFDOC.pageCount) {
                    return;
                }
                $scope.PDFDOC.pageNum = $scope.PDFDOC.pageCount;
                queueRenderPage($scope.PDFDOC.pageNum);
            };
            /**
             * this is to load the page entered in the current page textbox
             * @param $event
             * @constructor
             */
            $scope.GotoPage = function ($event) {
                //we are here means the current page value is changed in the UI
                if (_.isNumber($scope.PDFDOC.pageNum)) {
                    if (!UtilsService.inRange($scope.PDFDOC.pageNum, 1, $scope.PDFDOC.pageCount)) {
                        $scope.PDFDOC.pageNum = $scope.PDFDOC.pageCount;
                    }
                } else {
                    //don't render if not a number
                    return;
                }

                queueRenderPage($scope.PDFDOC.pageNum);

            };
            //</editor-fold>
        }],
        link: function (scope, element, attrs) {

            var _el = angular.element(element[0]);
            //this will be used to render the PDF inside controller
            scope.pdfWrapperDiv = _el.find('#pdfWrapper');
            //initiate teh PDF Load
            scope.Load_PDF_Document();

            /**
             * This is broad casted from the parent when a revision CI is clicked.
             */
            scope.$on('revision-clicked', function (event, done) {
                if (scope.PDFDOC.isPossibleCandidate) {
                    //reset the page number
                    scope.PDFDOC.pageNum = 1;
                    scope.Load_PDF_Document();
                }
            });
        }
    }
}])
    .run(['$templateCache', function ($templateCache) {
        var template = [
            '<div>',
                '<div class="group-action">',
                    /* PAGE BUTTONS */
                    '<div class="group-btn-page">',
                        '<a href="javascript:void(0)" class="buttons-first btn-first-page" ng-click="onFirstPage()"></a>',
                        '<a href="javascript:void(0)" class="buttons-up btn-previous" ng-click="onPrevPage()"></a>',
                        '<input type="number" placeholder="1" class="current-number" min="1" max="{{PDFDOC.pageCount}}" required ng-model="PDFDOC.pageNum" ng-change="GotoPage($event)" />',
                        '<label class="total-number">/ {{PDFDOC.pageCount || 999 }}</label>',
                        '<a href="javascript:void(0)" class="buttons-up btn-next" ng-click="onNextPage()"></a>',
                        '<a href="javascript:void(0)" class="buttons-first btn-last-page" ng-click="onLastPage()"></a>',
                        '<button type="button" class="btn btn-default btn-view btn-rollover" ng-click="onViewEmailClick($event)" ng-if="PDFDOC.showViewSelectButton">',
                            '<span sr-only="sr-only" class="closed">View {{PDFDOC.bShowEmail ? "CI" : "Email"}}</span>',
                        '</button>',
                    '</div>',
                    /*ZOOM DIRECTIVE*/
                    '<zoom-in-out></zoom-in-out>',
                '</div>',
                /* PDF VIEWER */
                '<div class="pdf-placeholder" ng-hide="PDFDOC.bShowEmail">',
                    '<div id="pdfWrapper" style="left:0; top:0; width: 100%; height: 100%; overflow: auto;"></div>',
                '</div>',
                /* EMAIL */
                '<div class="email-placeholder" ng-show="PDFDOC.bShowEmail" ng-If="PDFDOC.hasEmail">',
                    '<div class="emailWrapper" style="height: inherit; width: inherit;" ng-If="PDFDOC.hasEmail">',
                        '<iframe ng-src="{{PDFDOC.emailURL | trusted}}" style="width: 100%; height: 100%; background-color: #FFFFFF;"></iframe>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('');

        $templateCache.put("pdf_view_directive.htm", template);
    }]);