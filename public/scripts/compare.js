var TPVTB = TPVTB || {};

(function ($, exports) {
	"use strict";

	function updateDocumentWidth() {
		var $CIDocuments = $('.ci-document-container'),
			$pdfViewersCI = $('.compare-ci-screen .wrapper-pdf-placeholder'),
			$versionList = $('.version-list'),
			$pdfViewersRV = $('.compare-revision .pdf-placeholder'), //.wrapper-pdf-placeholder');
			$emailViewersRV = $('.compare-revision .email-placeholder');

		var $CIDocument = $('.ci-document-container-first'),
			$revisionCompareCI = $('.compare-ci-screen .revision-content'),
			$compareRV = $('.compare-revision'),
			$CIHeader = $('.ci-compare-header'),
			$meta = $CIDocument.find('.revision-meta'),
			$notify = $compareRV.find('.compare-notify-wrapper'),
			$versionInfo = $compareRV.find('.version-info'),
			$groupActions = $CIDocument.find('.group-action'),
			$annotation = $CIDocuments.find('.annotation'),
			$compareRVWrapper = $('.compare-version-current'),
			$RVBar = $compareRVWrapper.find('.revision-version'),
			$compareRVContent = $compareRVWrapper.find('.content-compare-version-current'),
			$RVActions = $('.compare-version-next .compare-action'),
			$RVGroupActions = $compareRV.find('.compare-version-next .group-action'),
			$RVHeader = $compareRV.find('.compare-header'),
			$RVNotify = $compareRV.find('.compare-notify'),
			$RVAside = $compareRV.find('.revision-version'),
			$RVList = $RVAside.find('.version-list'),
			browerHeight = $(window).height(),
			pdfHeight = browerHeight - $CIHeader.height() - $meta.height() - $groupActions.height() - 47;

		$pdfViewersCI.css('height', pdfHeight);
		$annotation.css('height', $revisionCompareCI.height());
		// delay a bit for re-update
		setTimeout(function() {
			$revisionCompareCI.css('width', $CIDocument.width() - 30 - 10);
			$compareRVContent.css('width', $('.compare-version-current').width() - 30 - 10);
			//PavaniKa: subtract 'version-info' from height
			$pdfViewersRV.css('height', browerHeight - $RVHeader.height() - $RVNotify.height() - $versionInfo.height() - $RVGroupActions.height() - $RVActions.height() - 95);
			$emailViewersRV.css('height', browerHeight - $RVHeader.height() - $RVNotify.height() - $versionInfo.height() - $RVGroupActions.height() - $RVActions.height() - 95);
			$RVAside.css('height', $compareRVWrapper.height() - $versionInfo.height() - 30); //PavaniKa: subtract 30 for paddings.

			$RVList.css('height', $RVAside.height() - $RVAside.find('.revision-fixed-top').height() - $RVAside.find('.revision-fixed-bottom').height());
		}, 100);

		//unbind is to remove previous bindings!
		$('.annotation .buttons-collapsed-ci').unbind().click(function(e) {
			var $annotation = $(e.target).closest('.annotation');
			$annotation.toggleClass('collapsed');
		});

		$('.revision-version .buttons-collapsed-ci').unbind().click(function(e) {
			var $revisionVersion = $(e.target).closest('.revision-version');
			$revisionVersion.toggleClass('collapsed');
		});

		//this is to add scrolling for versions list
		$('.version-list').jScrollPane({
			verticalGutter: 0,
			autoReinitialise: true,
			autoReinitialiseDelay: 100
		});
	}

	// Update width of input when resize browser
	function updateInputRVWidth() {
		var $optionNo = $('.compare-option .option-no'),
			$radioInline = $('.compare-notify-wrapper .option-no .radio-inline'),
			$compareOption = $('.compare-notify-wrapper .compare-option'),
			$input = $('.option-no .enter-reason'),
			inputWidth = $optionNo.width() - 84 - 20;

		$input.css('width', inputWidth);
	}

	// Update Width of Compare Version when resize browser
	function updateCompareRVWidth() {
		var $versionNext = $('.compare-revision .compare-version-next'),
			$versionCurrent = $('.compare-revision .compare-version-current'),
			browserWidth = $(window).width(),
			versionWidth = (browserWidth - 62) / 2;

		$versionNext.css('width', versionWidth);
		$versionCurrent.css('width', versionWidth);

		//adjust the 'group-action' width on right side if the 'revision-version' is not shown!
		var groupActionWidth = versionWidth  - 20; //subtract 20 for padding
		var margin = 0;
		if($versionCurrent.find('.revision-version').length > 0) {
			groupActionWidth -= 40;
			margin = 40;
		}
		$versionCurrent.find('.group-action').css('width', groupActionWidth)
			.css('margin-left', margin);


		// Implemented show/hide input when click on No (compare revision)
		var $reasonTxt = $('.enter-reason'),
			$optionNo = $('.compare-notify-wrapper .option-no'),
			$optionYes = $('.compare-notify-wrapper .option-yes');

		$('.option-no .radio-inline').click(function() {
			$optionNo.addClass('is-reason');
		});
		$('.option-yes .radio-inline').click(function() {
			$optionNo.removeClass('is-reason');
		});
	}

	// updated Width of Revision Content
	function updateCIDocumentWidth() {
		var $CIDocumentContainer = $('.ci-document-container'),
			$RevisionContainer = $('.compare-ci-screen .revision-content'),
			ciPadding = 35,
			widthCIDocument =  ($CIDocumentContainer.width() - ciPadding - 60 ) / 2;

		$RevisionContainer.css('width', widthCIDocument);

		// delay a bit for re-update
		// setTimeout(function() {
		// 	$RevisionContainer.css('width', widthCIDocument);
		// }, 10);
	}

	function AddCompareCIBehaviors() {
		var $pdfViewersCI = $('.compare-ci-screen .wrapper-pdf-placeholder'),
			$versionList = $('.version-list'),
			$pdfViewersRV = $('.compare-revision .wrapper-pdf-placeholder');

		setTimeout(function() {
			updateDocumentWidth();
			//updateInputRVWidth();
			//updateCompareRVWidth();
		}, 100);

		// Scroll for dropdown pdf reader
		$pdfViewersCI
			.jScrollPane({
				verticalGutter: 0,
				autoReinitialise			: true,
				autoReinitialiseDelay		: 100
			});

		$pdfViewersRV
			.jScrollPane({
				verticalGutter: 0,
				autoReinitialise			: true,
				autoReinitialiseDelay		: 100
			});

		$versionList
			.jScrollPane({
				verticalGutter: 0,
				autoReinitialise			: true,
				autoReinitialiseDelay		: 100
			});

		$(window).on('resize', function() {
			updateDocumentWidth();
			//updateInputRVWidth();
			//updateCompareRVWidth();
		});
	}

	function AddPossibleRevisionsBehaviors() {
		//like the above functions
		// Click on radio buttons to show/hide content on CI-details
		var $stapleOpt = $('.staple-option');
		$('.radio-btn-yesno').unbind().click(function (e) {
			var $target = $(e.target),
				val = $target.closest('.staple-btn').val();
			if (val === 'YES') {
				$stapleOpt.removeClass('active-no');
				$stapleOpt.addClass('active-yes');
			} else {
				$stapleOpt.removeClass('active-yes');
				$stapleOpt.addClass('active-no');

			}
		});

		setTimeout(function() {
			updateCIDocumentWidth();
			updateDocumentWidth();
			updateInputRVWidth();
			updateCompareRVWidth();
		}, 100);

		$(window).on('resize', function() {
			updateCIDocumentWidth();
			updateDocumentWidth();
			updateInputRVWidth();
			updateCompareRVWidth();
		});
	}

	exports.AddPossibleRevisionsBehaviors = AddPossibleRevisionsBehaviors;
	exports.AddCompareCIBehaviors = AddCompareCIBehaviors;

}).call(this, jQuery, TPVTB);