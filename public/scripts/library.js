/**
 * TPVTB is the namespace used across the application for all
 * traffic bridge related functions.
 * @type {{}}
 */
var TPVTB = TPVTB || {};

(function ($, exports) {
    "use strict";

    // Init scroll
    function AddScrollingToLibraryScreen() {
        var $ = jQuery.noConflict();
        var $pagination = $('.lib-pagination'),
        // constant to show pagination when scroll to the bottom
            heightFromBottom = 30;
        $('.content')
            .bind(
            'jsp-scroll-y',
            function (event, scrollPositionY, isAtTop, isAtBottom) {
                var marginTop = $('.header-library').height() + $('.filter-group').height(),
                    $contentSection = $('.jspPane'),
                    $machingCi = $('.affix-matching'),
                    $machingCiWrapper = $('.match-ci');
                if (scrollPositionY > marginTop) {
                    var height = scrollPositionY - marginTop - 2;
                    $machingCi.addClass('affix-scrolling');
                    $machingCi.css('top', height);
                    $machingCiWrapper.css('height', $machingCi.height());
                    $contentSection.addClass('scrolling');
                    $machingCiWrapper.css('width', $('.content').width());
                } else {
                    $machingCi.removeClass('affix-scrolling');
                    $contentSection.removeClass('scrolling');
                    $machingCiWrapper.removeAttr('style');
                }

                // Implemented show/hide pagination when scroll at the bottom
                if ((scrollPositionY + $('.content').height() + heightFromBottom) > $('.content .scrolling').height()) {
                    $pagination.css('visibility', 'visible');
                } else {
                    $pagination.css('visibility', 'hidden');
                }

            }
        )
            .jScrollPane({
                verticalGutter: 0,
                autoReinitialise: true,
                autoReinitialiseDelay: 100,
                contentWidth: '0px'
            });

        //Scroll for dropdown Advertiser
        $('.list-select')
            .jScrollPane({
                verticalGutter: 0,
                autoReinitialise: true,
                autoReinitialiseDelay: 100
            });

        // Show/hide ignored CI
        var $content = $('.content'),
            $mainContent = $('.main-content'),
            isListView = false;
        $('.show-ignored').click(function() {
            $content.addClass('is-ignored');
            if ($mainContent.hasClass('list-view')) {
                isListView = true;
            } else {
                isListView = false;
                $mainContent.addClass('list-view');
            }
        });

        $('.back-to-lib').click(function() {
            $content.removeClass('is-ignored');
            if (!isListView) {
                $mainContent.removeClass('list-view');
            }

        });
    }

    exports.AddScrollingToLibraryScreen = AddScrollingToLibraryScreen;

}).call(this, jQuery, TPVTB);
