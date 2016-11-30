/**
 * TPVTB is the namespace used across the application for all
 * traffic bridge related functions.
 * @type {{}}
 */

var TPVTB = TPVTB || {};

(function ($, exports) {
    "use strict";

    function setHeight() {
        var $sidebar = $('.sidebar-info'),
            userInfoHeight = $('.user-info').height();
        var browerHeight = $(window).height();
        // Update height for sidebar & content when resize
        $('.content').css('height', browerHeight);
        $sidebar.css('height', browerHeight - userInfoHeight);
    }

    function ToggleLeftNavigationBar() {

        var $wrapper = $('.wrapper');
        $('.user-collapsed').click(function () {
            //console.log('clicked');
            if ($wrapper.hasClass('collapsed')) {
                $wrapper.removeClass('collapsed');

                //this is to fix the SPAN not collapsing issue
                //might be different bootstrap/angular versions!
                if (!$('span.user-name-collapsed').hasClass('collapse')) {
                    $('span.user-name-collapsed').addClass('collapse');
                }

            } else {
                $wrapper.addClass('collapsed');

                //$('span.user-name-collapsed').removeClass('collapse');
            }
        });

        // Set height for main content based on brower's height
        var browerHeight;

        //this is added to top because this is called from multiple screens.
        /*function setHeight() {
         var $sidebar = $('.sidebar-info'),
         userInfoHeight = $('.user-info').height();
         browerHeight = $(window).height();
         // Update height for sidebar & content when resize
         $('.content').css('height', browerHeight);
         $sidebar.css('height', browerHeight - userInfoHeight);
         }*/
        setHeight();

        // Init scroll for sidebar
        $('.sidebar-info').jScrollPane({
            verticalGutter: 0,
            autoReinitialise: true,
            autoReinitialiseDelay: 100
        });

        // Init scroll each time click on CI
        $('.ci').click(function () {
            // Using scroll bar revision versions list
            $('.version-list').jScrollPane({
                verticalGutter: 0,
                autoReinitialise: true,
                autoReinitialiseDelay: 100
            });
        });

        // Change view CI list mode
        var $viewListBtn = $('.view-mode .btn'),
            $mainContent = $('.main-content');
        $viewListBtn.click(function (e) {
            var $target = $(e.target).closest('.btn');
            $viewListBtn.removeClass('selected');
            $target.addClass('selected');
            if ($target.hasClass('btn-list')) {
                $mainContent.addClass('list-view');
            } else {
                $mainContent.removeClass('list-view');
            }
        });


        // Toggle show more/less filter
        var $libraryHeader = $('.content-header-library');
        var $moreFilter = $('.more');
        $moreFilter.click(function () {
            if ($libraryHeader.hasClass('show-more')) {
                $moreFilter.html('More Filters');
                $libraryHeader.removeClass('show-more');
            } else {
                $moreFilter.html('Less Filters');
                $libraryHeader.addClass('show-more');
            }
        });
    }


    // CI Details behavior
    function AddCIDetailsToggleBehaviors() {

        // CI Details behavior
        var $annotation = $('.annotation'),
            $annotationWR = $('.annotation-wrapper'),
            $revisionPanel = $('.ci-detail .revision-version'),
            $revisionPanelWR = $('.ci-detail .revision-version-wrapper');

        // Resize CI document
        var $CIContent = $('.ci-detail .ci-content'),
            $CIDocument = $('.ci-detail .revision-content'),
            ciPadding = 60,
            $CIHeader = $('.ci-detail .ci-header'),
            $CICondition = $('.ci-detail .group-conditions'),
            $pdfReader = $('.ci-detail .pdf-placeholder'),
            $wrapperPdfReader = $('.wrapper-pdf-placeholder'),
            $wrapperEmailReader = $('.wrapper-email-placeholder');

        function resizeCIDocument(msgHeight) {
            //subtract the revisions width only if it is shown!
            var ciDocumentWidth = $CIContent.width() - $revisionPanelWR.width() - $annotationWR.width() - ciPadding,
            //var ciDocumentWidth = $CIContent.width() - ($revisionPanel.css('display') === 'block' ? $revisionPanel.width() : 0) - $annotation.width() - ciPadding,
                browerHeight = $(window).height() - 10,
                ciMsgHeight = msgHeight || 0,
                ciDocumentHeight = browerHeight - $CIHeader.height() - $CICondition.height(),
                revisionListHeight = ciDocumentHeight - $revisionPanel.find('.revision-fixed-top').height() - $revisionPanel.find('.revision-fixed-bottom').height() - 10,
                pdfReaderHeight = ciDocumentHeight - 139;
            $CIDocument.css('width', ciDocumentWidth);
            $CIContent.css('height', ciDocumentHeight);
            $wrapperPdfReader.css('height', pdfReaderHeight, $CIContent.find('.revision-meta').height() - $CIContent.find('.group-action').height() - 33);
            $wrapperEmailReader.css('height', pdfReaderHeight, $CIContent.find('.revision-meta').height() - $CIContent.find('.group-action').height() - 33);
            $revisionPanel.find('.version-list').css('height', revisionListHeight);
            $revisionPanel.css('height', ciDocumentHeight - ciMsgHeight - 10);
            //$('.ci-detail .annotation.collapsed').css('height', $CIDocument.height());
            //$('.ci-detail .annotation').css('height', $CIDocument.height() - 45); //subtract 45 for header
            var $CIAnnotation = $('.ci-detail .annotation');
            $CIAnnotation.css('height', $CIDocument.height());
            $('.ci-detail .group-btn-zoom').css('width', ciDocumentWidth - $('.ci-detail .group-btn-page').width() - $('.ci-detail .group-btn-action').width() -  31);
            // need to delay a bit
            setTimeout(function() {
                $CIAnnotation.find('.wrap-panel-list').css('height', $CIDocument.height() - ciMsgHeight - 41);
            }, 50);
        }

        $('.ci-detail .annotation .buttons-collapsed-ci').click(function (e) {
            var $annotation = $(e.target).closest('.annotation');
            $annotation.toggleClass('collapsed');
            //this is to toggle the sice viewer
            $('div.annotation-side-viewer').toggleClass('collapsed');
            resizeCIDocument();
            if ($annotation.hasClass('collapsed')) {
                $annotation.css('height', $CIDocument.height());
            } else {
                $annotation.css('height', $CIDocument.height() - 45); //subtract 45 for header
            }
        });

        // Collapse/Expand mode of revision version panel
        $('.ci-detail .revision-version .buttons-collapsed-ci').click(function (e) {
            var $revision = $(e.target).closest('.revision-version');
            $revision.toggleClass('collapsed');
            resizeCIDocument();
        });

        // Implement click on Compare button to display Revision version Select mode
        var $compareRevision = $('.compare-revision');
        $('.btn-compare').click(function () {
            if ($revisionPanel.hasClass('select-mode')) {
                $compareRevision.modal('show');
                $revisionPanel.removeClass('select-mode');
            } else {
                $revisionPanel.addClass('select-mode');
            }
        });

        /**
         * This is not fired by angular bootstrap so call it explicitly!
         */
        $('.ci-detail').on('shown.bs.modal', function () {
            resizeCIDocument();
            // Scroll for dropdown pdf reader
            $wrapperPdfReader
                .jScrollPane({
                    verticalGutter: 0,
                    autoReinitialise: true,
                    autoReinitialiseDelay: 100
                });
        });
        setTimeout(function () {
            resizeCIDocument();
        }, 100);

        /*function updateViewAnnotationList() {
         var maxHeightAnnotationList = $('.revision-version').height() + 40,
         $annotationList = $(".wrap-annotation-list"),
         $dropdownMenu = $annotationList.closest('.dropdown-menu');
         if ($annotationList.hasClass("jspScrollable")) {
         $dropdownMenu.addClass('is-scrolling');
         $annotationList.css('height', maxHeightAnnotationList);
         } else {
         $dropdownMenu.removeClass('is-scrolling');
         $annotationList.css('height', $annotationList.find('.annotation-list').height() + 20);
         }
         }

         // Listen scrolling status of Annotation list
         $(".wrap-annotation-list").on("DOMSubtreeModified", function () {
         updateViewAnnotationList();
         });*/

        // Update height of content when resize
        $(window).on('resize', function () {
            setHeight();
            resizeCIDocument();
            //updateViewAnnotationList();
        });

        // Implement click on Edit link to enable Textare, "Cancel" and "Save" button
        var $notes = $('.revision-meta .notes');
        $('.revision-meta .edit').click(function () {
            if ($notes.hasClass('is-editing')) {
                $notes.removeClass('is-editing');
            } else {
                $notes.addClass('is-editing');
                //RSG: focus into the textarea!
                $('#edit-notes-textarea').focus().delay(100);
            }
        });

        $('.revision-meta .notes .btn-cancel').click(function () {
            $notes.removeClass('is-editing');
        });

        $('.revision-meta .notes .btn-ok').click(function () {
            $notes.removeClass('is-editing');
        });
        // Click on each revision version
        var $versionItems = $('.version-item');
        $('.version-item').click(function (e) {
            var $target = $(e.target).closest('.version-item');
            if (!$target.hasClass('in-active') && $revisionPanel.hasClass('select-mode')) {
                if ($target.hasClass('is-selected')) {
                    $target.removeClass('is-selected');
                } else {
                    $target.addClass('is-selected');
                }
                // $target.find('input').attr('checked', 'checked');
            }
        });

        // Close compare revision fix can not scroll when open more than 2 bootstrap modals
        var $body = $('body');
        $('.modal').on('hidden.bs.modal', function (event) {
            var backDrop = $('.modal-backdrop');
            if (backDrop && backDrop.length >= 1) {
                $body.addClass('modal-open');
            }
        });

        // Disable click blur to close dropdown
        var $dropdown = $('.dropdown');
        $('.dropdown.keep-open').on({
            "shown.bs.dropdown": function(e) {
                var $target = $(e.target),
                    $selectAnnotation = $target.find('.select-annotation');
                if ($selectAnnotation.length === 0) {
                    $dropdown.removeClass('open');
                    $(e.target).closest('.dropdown').addClass('open');
                    this.closable = false;
                }
            },
            "click": function(e) {
                var $target = $(e.target),
                    $selectAnnotation = $target.find('.select-annotation');
                if ($target.hasClass('btn-primary') || $target.hasClass('btn-dropdown') || $target.hasClass('btn-ok') || $target.hasClass('onwer-selection') || $target.hasClass('result')) {
                    this.closable = true;
                } else {
                    this.closable = false;
                }
            },
            "hide.bs.dropdown": function(e) {
                return this.closable;
            }
        });
        // Handle click outsite to hide onwer dropdwon
        $(document).click(function(event) {
            if(!$(event.target).closest('.select-owner-ci').length) {
                var $onwerDropdown = $('.select-owner-ci .dropdown');
                if($onwerDropdown.hasClass("open")) {
                    $onwerDropdown.removeClass('open');
                }
            }
        });

        $('.ci-detail .filter-status .dropdown').click(function (e) {
            var $target = $(e.target).closest('.dropdown');
            $target.toggleClass('open');
            e.stopPropagation();
            return false;
        });

        $('div.annotation').on('click', '.annotator-viewer-edit', function (event) {
            //console.log('how to get annotation object?', $(event.target).closest('li.annotator-marginviewer-element.me').attr('id'));
            $(".annotator-edit").trigger("click");
            event.preventDefault();
        });

        $('div.annotation').on('click', '.annotator-viewer-delete', function (event) {
            $('.annotator-delete').trigger('click');
            event.preventDefault();
        });

        //this is to add scrolling for versions list
        $('.version-list').jScrollPane({
            verticalGutter: 0,
            autoReinitialise: true,
            autoReinitialiseDelay: 100
        });

        //annotations panel (right side)
        $('.wrap-panel-list')
            .jScrollPane({
                verticalGutter: 0,
                autoReinitialise: true,
                autoReinitialiseDelay: 100
            });
    }

    function AddViewAllAnnotationsBehaviors() {

        function updateViewAnnotationList() {
            var maxHeightAnnotationList = $('.revision-version').height() + 40,
                $annotationList = $(".wrap-annotation-list"),
                $dropdownMenu = $annotationList.closest('.dropdown-menu');
            if ($annotationList.hasClass("jspScrollable")) {
                $dropdownMenu.addClass('is-scrolling');
                $annotationList.css('height', maxHeightAnnotationList);
            } else {
                $dropdownMenu.removeClass('is-scrolling');
                $annotationList.css('height', $annotationList.find('.annotation-list').height() + 20);
            }
        }

        // Listen scrolling status of Annotation list
        $(".wrap-annotation-list").on("DOMSubtreeModified", function () {
            updateViewAnnotationList();
        });

        // Update height of content when resize
        $(window).on('resize', function () {
            updateViewAnnotationList();
        });

        /*var $dropdown = $('.annotation-dropdown.dropdown');
        $('.annotation-dropdown.dropdown.keep-open').unbind().on({
            "shown.bs.dropdown": function(e) {
                var $target = $(e.target),
                    $selectAnnotation = $target.find('.select-annotation');
                if ($selectAnnotation.length === 0) {
                    $dropdown.removeClass('open');
                    $(e.target).closest('.dropdown').addClass('open');
                    this.closable = false;
                }
            },
            "click": function(e) {
                var $target = $(e.target),
                    $selectAnnotation = $target.find('.select-annotation');
                if ($target.hasClass('btn-primary') || $target.hasClass('btn-dropdown') || $target.hasClass('btn-ok') ||
                    $target.hasClass('onwer-selection') || $target.hasClass('result')) {
                    //|| $target.hasClass('btn-default') || $target.parent().hasClass('annotation-search')) {
                    this.closable = true;
                } else {
                    this.closable = false;
                }
            },
            "hide.bs.dropdown": function(e) {
                return this.closable;
            }
        });*/
        // Handle click outsite to hide onwer dropdwon
        /*$(document).click(function(event) {
            if(!$(event.target).closest('.select-owner-ci').length) {
                var $onwerDropdown = $('.select-owner-ci .dropdown');
                if($onwerDropdown.hasClass("open")) {
                    $onwerDropdown.removeClass('open');
                }
            }
        });*/

        $('.annotation-dropdown.dropdown').unbind().click(function (e) {

            var a = $(e.target).parent().hasClass('annotation-search'); //search text box
            var b = $(e.target).hasClass('btn-go'); //Go button
            var c = $(e.target).hasClass('select-annotation') || $(e.target).parent().hasClass('select-annotation') || $(e.target).is('a'); //annotation type drop down
            var d = $(e.target).hasClass('glyphicon-remove'); //close button
            var f = !c && !d && $(e.target).parents().hasClass('annotation-dropdown-menu'); //annotation item

            if(a || b || f) {

            } else {
                var $target = $(e.target).closest('.dropdown');
                $target.toggleClass('open');
            }

            e.stopPropagation();
            return false;
        });

        //view all annotations panel
        $('.wrap-annotation-list')
            .jScrollPane({
                verticalGutter: 0,
                autoReinitialise			: true,
                autoReinitialiseDelay		: 100
            });
    }

    exports.ToggleLeftNavigationBar = ToggleLeftNavigationBar;
    exports.AddCIDetailsToggleBehaviors = AddCIDetailsToggleBehaviors;
    exports.AddViewAllAnnotationsBehaviors = AddViewAllAnnotationsBehaviors;

    //exports.AddPossibleRevisionsBehaviors = AddPossibleRevisionsBehaviors;
    //exports.AddFileCIBehaviors = AddFileCIBehaviors;


    /////////////////////////////////////////////////////////
    // AGILITYIO: Implement behavior for Dropdown library
    /////////////////////////////////////////////////////////
    // Init scroll bar
    //$('.multiSelect .wrap-checkboxContainer').jScrollPane({
    //    verticalGutter: 0,
    //    autoReinitialise: true,
    //    autoReinitialiseDelay: 100,
    //    contentWidth: '0px'
    //});
    //
    //// Show Clear button when focus on Search text box
    //$('.checkboxLayer .inputFilter').focus(function (e) {
    //    var $searchTxt = $(e.target).parent();
    //    $searchTxt.addClass('is-focus');
    //});
    //
    //// Hide search button when blur the Search text box
    //$('.checkboxLayer .inputFilter').blur(function (e) {
    //    setTimeout(function () {
    //        $('.checkboxLayer .inputFilter').parent().removeClass('is-focus');
    //    }, 200);
    //});
    //
    //// Implementation click on Close button of dropdown
    //$('.checkboxLayer .btn-primary').click(function () {
    //    $('.multiSelect').removeClass('buttonClicked');
    //    $('.checkboxLayer').removeClass('show');
    //});

}).call(this, jQuery, TPVTB);

/**
 * william:
 */
(function (tb) {
    tb.log = (function () {
        var debug = /(localhost|^10\.115\.160)/.
                test(location.host) && !!window.console;
        return function () {
            return debug ? console.log.apply(console, arguments) : null;
        }
    })();
}(TPVTB));
