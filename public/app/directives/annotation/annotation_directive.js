/**
 * william: need to implement, currently not work.
 */
var tbcc = angular.module("trafficbridge.cc");

tbcc.value('pdfWrapper', 'pdfWrapper');

tbcc.directive("tbccAnnotation", ["mvIdentity", function (mvIdentity) {
    "use strict";

    return {
        template: "<div>Annotation</div>",
        restrict: 'A',
        replace: true,
        controller: ['$scope', function ($scope) {

        }],
        link: function (scope, element, attrs) {

            var pdfWrapper = angular.element(element[0]), $pdfWrapper = $('#pdfWrapper');

            function setupAnnotations() {

                if (scope.ANNOTATORJS_LOADED == true) {

                    $.each(Annotator._instances.slice(0), function () {
                        this.destroy();
                    });

                    $('.annotations-list-uoc').remove();
                }

                if ($pdfWrapper.length) {

                    //console.log('Adding annotations...' + scope.ANNOTATORJS_LOADED);
                    var _pdfAnnotator = $pdfWrapper.annotator()
                        .annotator('setupPlugins', {}, {
                            readOnly: false,
                            Tags: false,
                            Filter: false,
                            Auth: false,
                            Store: false
                        });

                    $pdfWrapper.annotator().annotator('addPlugin', 'AnnotationStore', {
                        loadFromSearch: true,
                        onAnnotationStoreApiRequest: function (action, obj, onSuccess) {
                            handleAnnotationApiRequest(action, obj, onSuccess);
                        }
                    });

                    var pluginOptions = {
                        scale: scope.scale
                    }

                    //Permissions
                    _pdfAnnotator.data('annotator').addPlugin('Permissions', {
                        //user: mvIdentity.currentUser,
                        permissions: {
                            'read': [mvIdentity.currentUser.userName],
                            'update': [mvIdentity.currentUser.userName],
                            'delete': [mvIdentity.currentUser.userName],
                            'admin': [mvIdentity.currentUser.userName]
                        },
                        user: mvIdentity.currentUser.userName,
                        showViewPermissionsCheckbox: false,
                        showEditPermissionsCheckbox: false
                    });

                    $pdfWrapper.annotator().annotator('addPlugin', 'AnnotoriousImagePlugin', pluginOptions);

                    var styles = {}, categories = {
                        errata: 'annotator-hl-errata',
                        destacat: 'annotator-hl-destacat',
                        subratllat: 'annotator-hl-subratllat',
                        clearstuck: 'annotator-hl-clearstuck'
                    };

                    $pdfWrapper.annotator().annotator('addPlugin',
                        'Categories',
                        {
                            categories: categories,
                            styles: styles,
                            user: mvIdentity.currentUser.userName,
                            getStuckNotificationSubject: function () {
                                if (!scope.ci) {
                                    return "aaaaaa";
                                }
                                var airdateSt = "", airdateEnd = "";
                                if (scope.ci.air_date_start) {
                                    airdateSt = jQuery.format.date(new Date(scope.ci.air_date_start), "MM/dd/yyyy");
                                }
                                if (scope.ci.air_date_end) {
                                    airdateEnd = jQuery.format.date(new Date(scope.ci.air_date_end), "MM/dd/yyyy");
                                }

                                return "CI for Network '" + scope.ci.network + "', Advertiser '" + scope.ci.advertiser +
                                    "' and air dates '" + airdateSt + " - " + airdateEnd + "'";
                            }
                        });

                    //sideviewer.js:
                    $pdfWrapper.annotator().annotator('addPlugin', 'AnnotatorViewer');

                    $pdfWrapper.annotator().annotator('addPlugin', 'AnnotatorMarker', {
                        markerEventHandlers: {
                            load: function (options) {
                                if (options && options.hasOwnProperty("stuckMarkCount") && options.stuckMarkCount > 0) {
                                    console.log(options.stuckMarkCount);

                                } else {
                                }
                            },
                            create: function (options) {
                                if (options && options.hasOwnProperty("stuckMarkCount") && options.stuckMarkCount === 1
                                    && options.category && options.category === "errata") {
                                    updateCIStuckStatus(true);
                                }
                            },
                            update: function (options) {
                                if (options && options.hasOwnProperty("stuckMarkCount") && options.stuckMarkCount === 0
                                    && options.category && options.category === "clearstuck") {
                                    updateCIStuckStatus(false);
                                }
                            },
                            delete: function (options) {
                                if (options && options.hasOwnProperty("stuckMarkCount") && options.stuckMarkCount === 0
                                    && options.category && options.category === "errata") {
                                    updateCIStuckStatus(false);
                                }
                            }
                        }
                    });

                    //add scrollbar to the SideBar
                    $('#anotacions-uoc-panel').slimscroll({height: '100%'});
                }

                /*
                 * wait until the current digest cycle is over to update the flag!
                 * This is to prevent Error: [$rootScope:inprog] $digest already in progress
                 */
                $timeout(function () {
                    scope.$apply(function () {
                        scope.ANNOTATORJS_LOADED = true;

                        /**
                         * william: re-activate 'zoom' button after delay 2 seconds.
                         * This is to prevent user from continuously quick-click zooming.
                         */
                        scope.$broadcast('zoom-processing', 'done');
                    });
                });
            }

            function adjustShape(shapes) {
                var geo = shapes[0].geometry;
                geo.x = Number((geo.x / zscale).toFixed(2));
                geo.y = Number((geo.y / zscale).toFixed(2));
                geo.width = Number((geo.width / zscale).toFixed(2));
                geo.height = Number((geo.height / zscale).toFixed(2));
            }

            function adjustAnnotationShape(shape, create) {
                var newShape = angular.copy(shape), geo = newShape.geometry, zscale = scope.scale;
                console.log("Before ---", geo, zscale);
                if (zscale !== 1) {
                    if (!create) {
                        geo.x = Number((geo.x * zscale).toFixed(2));
                        geo.y = Number((geo.y * zscale).toFixed(2));
                        geo.width = Number((geo.width * zscale).toFixed(2));
                        geo.height = Number((geo.height * zscale).toFixed(2));
                    } else {
                        geo.x = Number((geo.x / zscale).toFixed(2));
                        geo.y = Number((geo.y / zscale).toFixed(2));
                        geo.width = Number((geo.width / zscale).toFixed(2));
                        geo.height = Number((geo.height / zscale).toFixed(2));
                    }
                }
                console.log("After ---", geo, zscale);

                return newShape;
            }

            function handleAnnotationApiRequest(action, obj, onSuccess) {

                var successNotification = "", errorNotification = "", handleSuccess = null, onError = null;
                successNotification = "'" + action + "'" + " annotation was successful";
                errorNotification = "Failed to " + "'" + action + "'" + " annotation";
                handleSuccess = function (data) {
                    if (action !== "search") {
                        if (data && data.shapes && data.shapes.length !== 0) {
                            var newShape = adjustAnnotationShape(data.shapes[0], false);
                            data.shapes[0] = newShape;
                        }
                        NotifierService.notifySuccess(successNotification);
                    } else {
                        if (data && data.length !== 0) {
                            data.forEach(function (annotation) {
                                if (annotation.shapes && annotation.shapes.length !== 0) {
                                    var newShape = adjustAnnotationShape(annotation.shapes[0], false);
                                    annotation.shapes[0] = newShape;
                                }
                            });
                        }
                    }
                    onSuccess(data);
                };
                onError = function () {
                    NotifierService.notifySuccess(errorNotification);
                };

                if (action === "create") {
                    if (obj && obj.shapes && obj.shapes.length !== 0) {
                        var newShape = adjustAnnotationShape(obj.shapes[0], true);
                        obj.shapes[0] = newShape;
                    }
                    DataService.Annotations.createAnnotation(scope.ciId, scope.pageNum, obj).then(handleSuccess).catch(onError);
                } else if (action === "update") {
                    if (obj && obj.shapes && obj.shapes.length !== 0) {
                        var newShape = adjustAnnotationShape(obj.shapes[0], true);
                        obj.shapes[0] = newShape;
                    }
                    DataService.Annotations.updateAnnotation(obj.id, obj).then(handleSuccess).catch(onError);
                } else if (action === "destroy") {
                    DataService.Annotations.removeAnnotation(obj.id, obj).then(handleSuccess).catch(onError);
                } else if (action === "search") {
                    DataService.Annotations.getAnnotations(scope.ciId, scope.pageNum).then(handleSuccess).catch(onError);
                }
            }

            function updateCIStuckStatus(isStuck) {
                var successNotification = "", errorNotification = "";
                if (isStuck) {
                    successNotification = "Successfully created a Stuck flag on CI: ";
                    errorNotification = "Failed to create a Stuck flag on CI: ";
                } else {
                    successNotification = "Successfully cleared a Stuck flag on CI: ";
                    errorNotification = "Failed to clear a Stuck flag on CI: ";
                }

                if ((!scope.ci.stuck && isStuck) || (scope.ci.stuck && !isStuck)) {
                    updateCIStatus(isStuck, scope.ci, function (data) {
                        scope.selectedStatus.value = APP_CONFIG.CI.STATUS.IN_PROGRESS;
                        NotifierService.notifySuccess(successNotification + scope.ci._id);
                    }, function () {
                        NotifierService.notifySuccess(errorNotification + scope.ci._id);
                    });
                }
            }

            function updateCIStatus(isStuck, ci, onSuccess, onError) {
                if (isStuck) {
                    ci.status = APP_CONFIG.CI.STATUS.IN_PROGRESS;
                    ci.stuck = isStuck;
                    ci.put().then(onSuccess).catch(onError);
                } else {
                    DataService.Annotations.getAnnotationsCountByCategory(scope.ci._id, "errata").then(function (data) {
                        if (data.count === 0) {
                            ci.stuck = isStuck;
                            ci.put().then(onSuccess).catch(onError);
                        } else {
                            // Stuck annotations still exist, across pages / versions
                        }

                    }).catch(onError);
                }
            }
        }
    }
}]);