function TrafficCoordinatorCIViewCtrl($scope,
                                      $location,
                                      $routeParams,
                                      $timeout,
				      $log,
                                      mvIdentity,
                                      DataService,
                                      NotifierService,
                                      ci,
                                      //parkinglot,
                                      APP_CONFIG) {

    $scope.ci = ci;

    var $jQL = jQuery.noConflict(),
        pdfWrapperContent = "<div id='pdfContainer' class='pdf-content' style='position:absolute;z-index:0;'></div>"+
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
    $scope.scale = 1.25; //testing, default value was 1
    $scope.$canvas = $jQL("<canvas></canvas>");

    //TODO: Move all the communications to a Service (This is just a POC)

    //** PDFJS Related **//
    PDFJS.disableWorker = true;

    var pdfURL = ci.ingest.files.common.url;

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

                $jQL("#pdfWrapper").width(viewport.width);
                $jQL("#pdfWrapper").height(viewport.height);

                $jQL("#pdfContainer").width(viewport.width);
                $jQL("#pdfContainer").height(viewport.height);

                $jQL("#imgAnnotatable").width(viewport.width);
                $jQL("#imgAnnotatable").height(viewport.height);

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
                        .css("height",viewport.height + "px")
                        .css("width",viewport.width + "px")
                        .offset({
                            top: $scope.ADD_ANNOTATIONS ? 0 : canvasOffset.top,
                            left: $scope.ADD_ANNOTATIONS ? 0 : canvasOffset.left
                        });

                    //$jQL("#pdfContainer").append($textLayerDiv);
                }

                page.getTextContent()
                    .then(function (textContent) {

                        var textLayer = new TextLayerBuilder($textLayerDiv.get(0),0); //The second zero is an index identifying
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
            //$log.debug('Destroying previous annotations: ' + Annotator._instances.length);
            $jQL.each(Annotator._instances.slice(0),function () {
                this.destroy();
            });

            $jQL('.annotations-list-uoc').remove();
        }
        else {
            //TODO: ???
        }

        if ($jQL('#pdfWrapper')) {

            //$log.debug('Adding annotations...' + $scope.ANNOTATORJS_LOADED);
            var _pdfAnnotator = $jQL('#pdfWrapper').annotator()
                .annotator('setupPlugins',{},{
                    readOnly: false,
                    Tags: false,
                    Filter: false,
                    Auth: false,
                    Store: {
                        prefix: '/api/annotations',
                        urls: {
                            create: '/create/:id/' + $scope.ciId + '/' + $scope.pageNum,
                            update: '/update/:id/' + $scope.ciId + '/' + $scope.pageNum,
                            destroy: '/destroy/:id/' + $scope.ciId + '/' + $scope.pageNum,
                            search: '/search/:id/' + $scope.ciId + '/' + $scope.pageNum
                        }
                    }
                });

            //Permissions
            _pdfAnnotator.data('annotator').addPlugin('Permissions',{
                //user: mvIdentity.currentUser,
                permissions: {
                    'read': [ mvIdentity.currentUser.userName ],
                    'update': [ mvIdentity.currentUser.userName ],
                    'delete': [ mvIdentity.currentUser.userName ],
                    'admin': [ mvIdentity.currentUser.userName ]
                },
                user: mvIdentity.currentUser.userName,

                userId: function (user) {
                    if (user && user.id) {
                        //$log.debug('########## userId 1');
                        return user.id;
                    }
                    //$log.debug('########## userId 2');
                    return user;
                },
                userString: function (user) {
                    if (user && user.username) {
                        //$log.debug('########## userString 1');
                        return user.username;
                    }
                    //$log.debug('########## userString 2');
                    return user;
                },
                userAuthorize: function (action,annotation,user) {

                    return true;
                },
                showViewPermissionsCheckbox: false,
                showEditPermissionsCheckbox: false
            });

            $jQL('#pdfWrapper').annotator().annotator('addPlugin', 'AnnotoriousImagePlugin');

            var styles = {}, categories = {
                errata: 'annotator-hl-errata',
                destacat: 'annotator-hl-destacat',
                subratllat: 'annotator-hl-subratllat',
                clearstuck:'annotator-hl-clearstuck'
            };
            /*            styles["errata"] = getCategoryStyles("errata");
                          styles["destacat"] = getCategoryStyles("destacat");
                          styles["subratllat"] = getCategoryStyles("subratllat");*/

            $jQL('#pdfWrapper').annotator().annotator('addPlugin',
                                                      'Categories',
                                                      {categories:categories,
                                                       styles:styles,
                                                       user: mvIdentity.currentUser.userName,
                                                       getStuckNotificationSubject: function(){
                                                           if(!$scope.ci){
                                                               return "";
                                                           }
                                                           var airdateSt = "", airdateEnd = "";
                                                           if($scope.ci.air_date_start){
                                                               airdateSt = jQuery.format.date(new Date($scope.ci.air_date_start), "MM/dd/yyyy");
                                                           }
                                                           if($scope.ci.air_date_end){
                                                               airdateEnd = jQuery.format.date(new Date($scope.ci.air_date_end), "MM/dd/yyyy");
                                                           }

                                                           return "CI for Network '"+$scope.ci.network+"', Advertiser '"+$scope.ci.advertiser+
                                                               "' and air dates '"+airdateSt+" - "+airdateEnd+"'";
                                                       }
                                                      });

            $jQL('#pdfWrapper').annotator().annotator('addPlugin','AnnotatorViewer');
            $jQL('#pdfWrapper').annotator().annotator('addPlugin','AnnotatorMarker', {
                markerEventHandlers:{
                    load: function(options){
                        if(options && options.hasOwnProperty("stuckMarkCount") && options.stuckMarkCount>0){
                            $log.debug(options.stuckMarkCount);
                            //updateStuckLabel(true);
                        }else{
                            //updateStuckLabel(false);
                        }
                    },
                    create: function(options){
                        if(options && options.hasOwnProperty("stuckMarkCount") && options.stuckMarkCount ===1
                           && options.category && options.category === "errata"){
                            updateCIStuckStatus(true);
                        }
                    },
                    update: function(options){
                        if(options && options.hasOwnProperty("stuckMarkCount") && options.stuckMarkCount=== 0
                           && options.category && options.category === "clearstuck"){
                            updateCIStuckStatus(false);
                        }
                    },
                    delete: function(options){
                        if(options && options.hasOwnProperty("stuckMarkCount") && options.stuckMarkCount=== 0
                           && options.category && options.category === "errata"){
                            updateCIStuckStatus(false);
                        }
                    }
                }
            });

            //add scrollbar to the SideBar
            $jQL('#anotacions-uoc-panel').slimscroll({ height: '100%' });
        }

        /*
         * wait until the current digest cycle is over to update the flag!
         * This is to prevent Error: [$rootScope:inprog] $digest already in progress
         */
        $timeout(function () {
            $scope.$apply(function () {
                $scope.ANNOTATORJS_LOADED = true;
                //$scope.contentAnnotator = contentAnnotator;
            });
        });
    }

    function getCategoryStyles(category){

        var style = {};

        switch (category) {
        case 'errata':
            style.hi_fill = "#FF7171";
            style.hi_stroke = "#FF7171";
            style.hi_outline = "#FF7171";
            style.hi_outline_width = "3";
            style.hi_stroke_width = "2.5";

            style.fill = "#FF7171";
            style.stroke = "#FF7171";
            style.outline = "#FF7171";
            style.outline_width = "2";
            style.stroke_width = "1.5";

            break;
        case 'destacat':
            style.hi_fill = "#71E471";
            style.hi_stroke = "#71E471";
            style.hi_outline = "#71E471";
            style.hi_outline_width = "3";
            style.hi_stroke_width = "2.5";

            style.fill = "#71E471";
            style.stroke = "#71E471";
            style.outline = "#71E471";
            style.outline_width = "2";
            style.stroke_width = "1.5";

            break;
        case'subratllat':
            style.hi_fill = "#FFEC71";
            style.hi_stroke = "#FFEC71";
            style.hi_outline = "#FFEC71";
            style.hi_outline_width = "3";
            style.hi_stroke_width = "2.5";

            style.fill = "#FFEC71";
            style.stroke = "#FFEC71";
            style.outline = "#FFEC71";
            style.outline_width = "2";
            style.stroke_width = "1.5";

            break;
        default :

        }
        return style;
    }
}

angular
    .module('trafficbridge.tc')
    .controller('TrafficCoordinatorCIViewCtrl',[
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
	'$log',
        'mvIdentity',
        'DataService',
        'NotifierService',
        'ci',
        //'parkinglot',
        'APP_CONFIG',
        TrafficCoordinatorCIViewCtrl
    ]);
