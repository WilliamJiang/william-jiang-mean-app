
function CopyCoordinatorCIViewCtrl($scope,
                                   $location,
                                   $routeParams,
                                   $timeout,
								   DataService,
								   NotifierService,
                                   APP_CONFIG) {
	
	var ci = {
    	    "__v" : 0,
    	    "_id" : $routeParams.id,
    	    "active" : true,
    	    "created_at" : "2015-02-23T16:32:51.795Z",
    	    "created_by" : "",
    	    "files" : {
    	        "common" : {
    	            "file_type" : "application/pdf",
    	            "url" : "cidoc/NBC.PDF"
    	        },
    	        "original" : {
    	            "file_type" : "application/pdf",
    	            "url" : "cidoc/NBC.PDF"
    	        }
    	    },
    	    "has_new_messages" : false,
    	    "method" : "manual",
    	    "note" : "accusantium possimus cum consequuntur",
    	    "pending_revision" : false,
    	    "stapled" : false,
    	    "status" : "delivered",
    	    "stuck" : false,
    	    "type" : "direct_response",
    	    "uninstructed_match" : false,
    	    "updated_at" : "2015-03-19T00:41:12.687Z"
    };
	
	var mvIdentity = {currentUser:{userName:"Sample User"}};
	

    $scope.ci = ci;
    $scope.ciId = $routeParams.id;


    var $jQL = jQuery.noConflict(),
        pdfWrapperContent = "<div id='pdfContainer' class='pdf-content' style='position:absolute;z-index:0;'></div>" +
            "<img id='imgAnnotatable' class='annotatable' style='opacity:0;position:absolute;' " +
            "src='../../custom-vendor/annotorious/transparent.gif'>";

    $scope.isCIStuck = false;
    $scope.ADD_ANNOTATIONS = true;
    $scope.ANNOTATORJS_LOADED = false;

    $scope.pdfDoc = null;
    $scope.pageNum = 1;
    $scope.pageCount = 1;
    $scope.pageRendering = false;
    $scope.pageNumPending = null;
    $scope.scale = 1; //testing, default value was 1
    $scope.$canvas = $jQL("<canvas></canvas>");


    //TODO: Move all the communications to a Service (This is just a POC)

    //** PDFJS Related **//
    PDFJS.disableWorker = true;

    // Compatibility
    var pdfURL;

    if (ci.ingest) {
        pdfURL = ci.ingest.files.common.url;
    }
    else {
        pdfURL = ci.files.common.url;
    }

    var pid = pdfURL.match(/(?:\/.*\/(.*:?))\.pdf/i)[1];
    pdfURL = '/api/pdf/' + pid;

    PDFJS.getDocument(pdfURL)
        .then(function (pdfDoc_) {

            $scope.$apply(function () {
                $scope.pdfDoc = pdfDoc_;
                $scope.pageCount = $scope.pdfDoc.numPages;
            });

            // Initial/first page rendering
            renderPage($scope.pageNum);
        });

    function renderPage(num) {

        $scope.pageRendering = true;
        $jQL("#pdfWrapper").html(pdfWrapperContent);

        // Using promise to fetch the page
        $scope.pdfDoc.getPage(num)
            .then(function (page) {

                var viewport = page.getViewport($scope.scale);
                var canvas = $scope.$canvas.get(0);
                var context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                $jQL("#pdfWrapper")
                    .width(viewport.width)
                    .height(viewport.height);

                $jQL("#pdfContainer")
                    .width(viewport.width)
                    .height(viewport.height);

                $jQL("#imgAnnotatable")
                    .width(viewport.width)
                    .height(viewport.height);

                //$('#pdfWrapper, #pdfContainer, #imgAnnotatable').css({
                //   'width': viewport.width + 'px'
                //});

                //Append the canvas to the pdf container div
                $jQL("#pdfContainer").append($scope.$canvas);

                var canvasOffset = $scope.$canvas.offset();

                var $textLayerDiv = $jQL('.textLayer');
                if ($textLayerDiv.get(0)) {
                    //just clear the content
                    $textLayerDiv.empty();
                }
                else {
                    //Add new textLayer
                    $textLayerDiv = $jQL("<div />")
                        .addClass("textLayer")
                        .css("height", viewport.height + "px")
                        .css("width", viewport.width + "px")
                        .offset({
                            top: $scope.ADD_ANNOTATIONS ? 0 : canvasOffset.top,
                            left: $scope.ADD_ANNOTATIONS ? 0 : canvasOffset.left
                        });

                    //$jQL("#pdfContainer").append($textLayerDiv);
                }

                page.getTextContent()
                    .then(function (textContent) {

                        var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0); //The second zero is an index identifying
                        //the page. It is set to page.number - 1.
                        textLayer.setTextContent(textContent);

                        var renderContext = {
                            canvasContext: context,
                            viewport: viewport,
                            textLayer: textLayer
                        };

                        var renderTask = page.render(renderContext); //.then(AddAnnotations);
                        // Wait for rendering to finish
                        renderTask
                            .then(function () {

                                $scope.pageRendering = false;

                                if ($scope.pageNumPending !== null) {
                                    // New page rendering is pending
                                    renderPage($scope.pageNumPending);
                                    $scope.pageNumPending = null;
                                }

                                setupAnnotations();
                            });
                    });
            });
    }

    $scope.renderPage = renderPage.bind($scope);


    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    function queueRenderPage(num) {

        if ($scope.pageRendering) {
            $scope.pageNumPending = num;
        }
        else {
            renderPage(num);
        }
    }

    function onPrevPage() {

        if ($scope.pageNum <= 1) {
            return;
        }
        $scope.pageNum--;
        queueRenderPage($scope.pageNum);
    }

    $scope.onPrevPage = onPrevPage;

    function onNextPage() {

        if ($scope.pageNum >= $scope.pageCount) {
            return;
        }
        $scope.pageNum++;
        queueRenderPage($scope.pageNum);
    }

    $scope.onNextPage = onNextPage;

    //** AnnotatorJS Related **//

    function setupAnnotations() {

        if ($scope.ANNOTATORJS_LOADED == true) {
            //console.log('Destroying previous annotations: ' + Annotator._instances.length);
            $jQL.each(Annotator._instances.slice(0), function () {
                this.destroy();
            });

            $jQL('.annotations-list-uoc').remove();
        }
        else {
            //TODO: ???
        }

        if ($jQL('#pdfWrapper').length) {

            //console.log('Adding annotations...' + $scope.ANNOTATORJS_LOADED);
            var _pdfAnnotator = $jQL('#pdfWrapper').annotator()
                .annotator('setupPlugins', {}, {
                    readOnly: false,
                    Tags: false,
                    Filter: false,
                    Auth: false,
                    Store: false
                });

            $jQL('#pdfWrapper').annotator().annotator('addPlugin', 'AnnotationStore', {
                loadFromSearch: true,
                onAnnotationStoreApiRequest: function (action, obj, onSuccess) {
                    handleAnnotationApiRequest(action, obj, onSuccess);
                }
            });

            var pluginOptions = {
                scale: $scope.scale
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

                userId: function (user) {
                    if (user && user.id) {
                        //console.log('########## userId 1');
                        return user.id;
                    }
                    //console.log('########## userId 2');
                    return user;
                },
                userString: function (user) {
                    if (user && user.username) {
                        //console.log('########## userString 1');
                        return user.username;
                    }
                    //console.log('########## userString 2');
                    return user;
                },
                userAuthorize: function (action, annotation, user) {

                    return true;
                },
                showViewPermissionsCheckbox: false,
                showEditPermissionsCheckbox: false
            });

            $jQL('#pdfWrapper').annotator().annotator('addPlugin', 'AnnotoriousImagePlugin', pluginOptions);

            var styles = {}, categories = {
				subratllat: 'annotator-hl-subratllat',                
                destacat: 'annotator-hl-destacat',
				errata: 'annotator-hl-errata',                
                clearstuck: 'annotator-hl-clearstuck'
            };

            $jQL('#pdfWrapper').annotator().annotator('addPlugin',
                'Categories',
                {
                    categories: categories,
                    styles: styles,
                    user: mvIdentity.currentUser.userName,
                    getStuckNotificationSubject: function () {
                        if (!$scope.ci) {
                            return "aaaaaa";
                        }
                        var airdateSt = "", airdateEnd = "";
                        if ($scope.ci.air_date_start) {
                            airdateSt = jQuery.format.date(new Date($scope.ci.air_date_start), "MM/dd/yyyy");
                        }
                        if ($scope.ci.air_date_end) {
                            airdateEnd = jQuery.format.date(new Date($scope.ci.air_date_end), "MM/dd/yyyy");
                        }

                        return "CI for Network '" + $scope.ci.network + "', Advertiser '" + $scope.ci.advertiser +
                            "' and air dates '" + airdateSt + " - " + airdateEnd + "'";
                    }
                });

            //sideviewer.js:
            $jQL('#pdfWrapper').annotator().annotator('addPlugin', 'AnnotatorViewer');

            //add scrollbar to the SideBar
            $jQL('#anotacions-uoc-panel').slimscroll({height: '100%'});
        }

        /*
         * wait until the current digest cycle is over to update the flag!
         * This is to prevent Error: [$rootScope:inprog] $digest already in progress
         */
        $timeout(function () {
            $scope.$apply(function () {
                $scope.ANNOTATORJS_LOADED = true;

                /**
                 * william: re-activate 'zoom' button after delay 2 seconds.
                 * This is to prevent user from continuously quick-click zooming.
                 */
                $scope.$broadcast('zoom-processing', 'done');
            });
        });
    }


    function handleAnnotationApiRequest(action, obj, onSuccess) {

        var successNotification = "", errorNotification = "", handleSuccess = null, onError = null;
        successNotification = "'" + action + "'" + " annotation was successful";
        errorNotification = "Failed to " + "'" + action + "'" + " annotation";
        handleSuccess = function (data) {
            if (action !== "search") {
                if (data) {
					data.user = "Sample User";
                }
                NotifierService.notifySuccess(successNotification);
            } else {
                if (data && data.length !== 0) {
                    data.forEach(function (annotation) {
						annotation.user = "Sample User";
                    });
                }
            }
            onSuccess(data);
        };
        onError = function () {
            NotifierService.notifySuccess(errorNotification);
        };

        if (action === "create") {
            DataService.Annotations.createAnnotation($scope.ciId, $scope.pageNum, obj).then(handleSuccess).catch(onError);
        } else if (action === "update") {
            DataService.Annotations.updateAnnotation(obj.id, obj).then(handleSuccess).catch(onError);
        } else if (action === "destroy") {
            DataService.Annotations.removeAnnotation(obj.id, obj).then(handleSuccess).catch(onError);
        } else if (action === "search") {
            DataService.Annotations.getAnnotations($scope.ciId, $scope.pageNum).then(handleSuccess).catch(onError);
        }
    }

}

angular
    .module('app')
    .controller('CopyCoordinatorCIViewCtrl', [
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',"DataService","NotifierService",
        'APP_CONFIG',
        CopyCoordinatorCIViewCtrl
    ]);

