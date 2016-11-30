/**
 * TPVTB is the namespace used across the application for all
 * traffic bridge related functions.
 * @type {{}}
 */
var TPVTB = TPVTB || {};

(function ($, exports) {
    "use strict";

    // Init scroll
    function AddScrollingToHomeScreen() {
        var $ = jQuery.noConflict();

        //destroy previous instance!
        var api = $('.content').data('jsp');
        if (api) {
            api.destroy();
        }

        var browerHeight;

        function setHeight() {
            var $sidebar = $('.sidebar-info'),
                userInfoHeight = $('.user-info').height();
            browerHeight = $(window).height();
            // Update height for sidebar & content when resize
            $('.content').css('height', browerHeight);
            $sidebar.css('height', browerHeight - userInfoHeight);
        }

        setHeight();

        //initialize
        $('.content')
            .jScrollPane({
                verticalGutter: 0,
                autoReinitialise: true,
                autoReinitialiseDelay: 100,
                contentWidth: '0px'
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

    function AddScrollingToNewCIModal() {
        $('.list-select')
            .jScrollPane({
                verticalGutter: 0,
                autoReinitialise: true,
                autoReinitialiseDelay: 100
            });

        // Implemented show Add CI Note on File screen
        var $ciNote = $('.ci-note'),
            $noteTxt = $ciNote.find('.enter-note');

        $('.add-ci-note').click(function() {
            $ciNote.addClass('is-adding-note');
            $ciNote.removeClass('is-showing');
        });
        $('.ci-note .wrap-enter-note').click(function() {
            $ciNote.removeClass('is-adding-note');
            $ciNote.addClass('is-showing');
            $noteTxt.focus();
        });

        $('.wrap-panel-list')
            .jScrollPane({
                verticalGutter: 0,
                autoReinitialise			: true,
                autoReinitialiseDelay		: 100
            });

        $('.wrapper-select')
            .jScrollPane({
                verticalGutter: 0,
                autoReinitialise			: true,
                autoReinitialiseDelay		: 100
            });

        //Scroll for New CI
        /*$('.instruction-pdf')
            .jScrollPane({
                verticalGutter: 0,
                autoReinitialise: true,
                autoReinitialiseDelay: 100
            });*/

        // Implement for tooltip
        $('[data-toggle="tooltip"]').tooltip();
    }

    //TODO: Scroll for dropdown Advertiser
    /*$('.list-select')
        .jScrollPane({
            verticalGutter: 0,
            autoReinitialise			: true,
            autoReinitialiseDelay		: 100
        });*/

    exports.AddScrollingToHomeScreen = AddScrollingToHomeScreen;
    exports.AddScrollingToNewCIModal = AddScrollingToNewCIModal;

}).call(this, jQuery, TPVTB);
