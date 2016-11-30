(function () {
	var __bind = function (fn, me) {
			return function () {
				return fn.apply(me, arguments);
			};
		},
		__hasProp = {}.hasOwnProperty,
		__extends = function (child, parent) {
			for (var key in parent) {
				if (__hasProp.call(parent, key)) child[key] = parent[key];
			}

			function ctor() {
				this.constructor = child;
			}

			ctor.prototype = parent.prototype;
			child.prototype = new ctor();
			child.__super__ = parent.prototype;
			return child;
		};

	Annotator.Plugin.AnnotatorViewer = (function (_super) {
		__extends(AnnotatorViewer, _super);

		AnnotatorViewer.prototype.events = {
			'annotationsLoaded': 'onAnnotationsLoaded',
			'annotationCreatedOnServer': 'onAnnotationCreated',
			'annotationDeletedOnServer': 'onAnnotationDeleted',
			'annotationUpdatedOnServer': 'onAnnotationUpdated',
			".annotator-viewer-edit click": "onEditClick",
			".annotator-viewer-delete click": "onDeleteClick",
			".annotator-viewer-delete mouseover": "onDeleteMouseover",
			".annotator-viewer-delete mouseout": "onDeleteMouseout"
		};


		AnnotatorViewer.prototype.field = null;

		AnnotatorViewer.prototype.input = null;

		AnnotatorViewer.prototype.options = {
			AnnotatorViewer: {}
		};

		var $ = jQuery.noConflict();

		function AnnotatorViewer(element, options) {
			this.onAnnotationCreated = __bind(this.onAnnotationCreated, this);
			this.onAnnotationUpdated = __bind(this.onAnnotationUpdated, this);
			this.onDeleteClick = __bind(this.onDeleteClick, this);
			this.onDeleteMouseover = __bind(this.onDeleteMouseover, this);
			this.onDeleteMouseout = __bind(this.onDeleteMouseout, this);
			this.onEditClick = __bind(this.onEditClick, this);

			this.annotationPanelContainerID = "pdfWrapper";
			this.dateFormat = "MMM dd  hh:mm a";
			this.cssClasses = {
				border: {
					clearstuck: "is-clearstuck-list",
					errata: "is-stuck-list",
					destacat: "is-mark-list",
					subratllat: "is-note-list"
				},
				saveDisabled: "is-save-disabled"
			};
			this.customFields = {
				dealIDs: "DealIDs",
				markEndDatedUser: "MarkEndDatedUser",
				markEndDatedTime: "MarkEndDatedTime",
				markReviewedUser: "MarkReviewedUser",
				markReviewedTime: "MarkReviewedTime",
				markEndDateReviewedUser: "MarkEndDateReviewedUser",
				markEndDateReviewedTime: "MarkEndDateReviewedTime",
				markEndDated: "MarkEndDated",
				markReviewed: "MarkReviewed",
				markEndDateReviewed: "MarkEndDateReviewed",
				markReviewedOnViewer: "MarkReviewedOnViewer",
				markEndDatedOnViewer: "MarkEndDatedOnViewer",
				markEndDateReviewedOnViewer: "MarkEndDateReviewedOnViewer",
				markReviewedComments: "MarkReviewedComments",
				markEndDatedComments: "MarkEndDatedComments",
				markEndDateReviewedComments: "MarkEndDateReviewedComments",

				stuckReason: "StuckReason",
				stuckComments: "StuckComments",
				markStuckClearedUser: "MarkStuckClearedUser",
				markStuckClearedTime: "MarkStuckClearedTime",
				markStuckCleared: "MarkStuckCleared",
				clearStuckComments: "ClearStuckComments"
			};
			AnnotatorViewer.__super__.constructor.apply(this, arguments);

			//william for div.annotation
			var $anno = $('div.annotation');
			if ($anno.length) {
				//$anno.find('div.label-expand').append(this.createAnnotationPanel());

				/**
				 * PAVANIKA: for the expand/collapse & scrolling to work properly the panel needs
				 * to be added to 'annotation-side-viewer-list' DIV.
				 */
				$anno.find('div.annotation-side-viewer-list').append(this.createAnnotationPanel());
			} else {
				$("#" + this.annotationPanelContainerID).append(this.createAnnotationPanel());
			}

		};

		AnnotatorViewer.prototype.pluginInit = function () {
			var cat, color, i, isChecked, _ref;
			if (!Annotator.supported()) {
				return;
			}
		};

		AnnotatorViewer.prototype.onDeleteClick = function (event) {
			event.stopPropagation();
			if (confirm(i18n_dict.confirm_delete)) {
				this.click;
				return this.onButtonClick(event, 'delete');
			}
			return false;
		};

		AnnotatorViewer.prototype.onEditClick = function (event) {
			event.stopPropagation();
			return this.onButtonClick(event, 'edit');
		};

		AnnotatorViewer.prototype.onButtonClick = function (event, type) {
			var item;
			//item contains all the annotation information, this information is stored in an attribute called data-annotation.
			item = $(event.target).parents('.annotator-marginviewer-element');
			if (type == 'delete') return this.annotator.deleteAnnotation(item.data('annotation'));
			if (type == 'edit') { //We want to transform de div to a textarea
				var annotator = this.annotator,
					annotation = item.data('annotation');
				if (annotator && annotator.plugins.AnnotoriousImagePlugin) {
					annotator.publish('onReferenceAnnotationMouseOver', annotation);
				}
				$(".annotator-edit").trigger("click");

				if (annotator && annotator.plugins.AnnotoriousImagePlugin) {
					annotator.publish('onReferenceAnnotationMouseOut', annotation);
				}
			}
		};

		AnnotatorViewer.prototype.onDeleteMouseover = function (event) {
			$(event.target).attr('src', '/custom-vendor/annotator/1.2.9/img/papelera_over.png');
		};

		AnnotatorViewer.prototype.onDeleteMouseout = function (event) {
			$(event.target).attr('src', '/custom-vendor/annotator/1.2.9/img/icono_eliminar.png');
		};

		AnnotatorViewer.prototype.onAnnotationCreated = function (annotation) {
			this.createReferenceAnnotation(annotation);
			$('#count-anotations').text($('.container-anotacions').children('li').length - 1);
		};

		AnnotatorViewer.prototype.onAnnotationUpdated = function (annotation) {
			var elem = $("#annotation-" + annotation.id),
				cssClasses = this.cssClasses.border,
				category = annotation.category ? annotation.category : "";

			elem.html(this.constructAnnotation(annotation, true));

			if (category === "clearstuck") {
				elem.removeClass(cssClasses.errata);
				elem.addClass(cssClasses.clearstuck);
			}else if (category === "errata") {
				elem.addClass(cssClasses.errata);
				elem.removeClass(cssClasses.clearstuck);
			}
		};

		AnnotatorViewer.prototype.onAnnotationsLoaded = function (annotations) {
			var annotation;
			$('#count-anotations').text(annotations.length);
			if (annotations.length > 0) {
				for (i = 0, len = annotations.length; i < len; i++) {
					annotation = annotations[i];
					this.createReferenceAnnotation(annotation);
				}
			}
		};

		AnnotatorViewer.prototype.onAnnotationDeleted = function (annotation) {
			$("li").remove("#annotation-" + annotation.id);
			$('#count-anotations').text($('.container-anotacions').children('li').length - 1);
		};

		AnnotatorViewer.prototype.constructAnnotation = function (annotation, isUpdate) {
			// Add Edit Button (For all categories except Clear Stuck Annotations)
			var panelButtons = "<div class='wrap-edit'><img src=\"/custom-vendor/annotator/1.2.9/img/edit.png\"   class=\"annotator-viewer-edit\" title=\"Edit\"/></div>",
				annotationText = annotation.text ? annotation.text : "",
				userName = annotation.user && annotation.user.username ? annotation.user.username : annotation.user,
				createdDate = annotation.createdDate ? $.format.date(new Date(annotation.createdDate), this.dateFormat) : "",
				annotationHTML = "",
				annotationTextHTML = "",
				userWithCreatedDateHTML = "",
				customData = null,
				customDataLength = 0,
				fieldData = null,
				markedUser = null,
				markedDate = null;

			if (annotation) {
				if (annotation.customData) {
					customData = annotation.customData;
					customDataLength = customData.length;
				}

				if (annotation.customFields) {
					if (annotation.customFields.markedUser) {
						markedUser = annotation.customFields.markedUser;

					}
					if (annotation.customFields.markedDate) {
						markedDate = $.format.date(new Date(annotation.customFields.markedDate), this.dateFormat);
					}
				}
			}

			// Add Annotation Text
			annotationTextHTML = "<div class='annotator-marginviewer-text padding-bt-0'><div class='anotador_text'>" + annotationText + "</div></div>";

			// Add Created User with Time
			userWithCreatedDateHTML = "<div class='annotator-marginviewer-text'><div class='annotation-author'>" + markedUser + "</div><div class='annotation-date'>" + markedDate + "</div></div>";

			// Handle Stuck Annotations
			if (annotation.category === "errata") {
				var fldStuckReason = "";

				for (var i = 0; i < customDataLength; i++) {
					fieldData = customData[i];
					if (fieldData && fieldData.key) {
						if (fieldData.key === this.customFields.stuckReason) {
							fldStuckReason = fieldData.value;
						}
					}
				}

				annotationHTML += " <div class='annotator-marginviewer-footer'><h4 class='category-name'>Stuck:</h4> <p class='stuck-reason'>" + fldStuckReason + panelButtons + "</p></div>" + userWithCreatedDateHTML + annotationTextHTML;
				// Handle Applied Annotations
			} else if (annotation.category === "destacat") {
				var fldDealIDs = "",
					fldMarkEndDatedUser = null,
					fldMarkEndDatedTime = null,
					fldMarkReviewedUser = null,
					fldMarkReviewedTime = null,
					fldMarkEndDateReviewedUser = null,
					fldMarkEndDateReviewedTime = null;

				for (var i = 0; i < customDataLength; i++) {
					fieldData = customData[i];
					if (fieldData && fieldData.key) { //value
						if (fieldData.key === this.customFields.dealIDs) {
							fldDealIDs = fieldData.value;
						}
						if (fieldData.key === this.customFields.markEndDatedUser) {
							fldMarkEndDatedUser = fieldData.value;
						}
						if (fieldData.key === this.customFields.markEndDatedTime) {
							fldMarkEndDatedTime = fieldData.value;
						}
						if (fieldData.key === this.customFields.markReviewedUser) {
							fldMarkReviewedUser = fieldData.value;
						}
						if (fieldData.key === this.customFields.markReviewedTime) {
							fldMarkReviewedTime = fieldData.value;
						}
						if (fieldData.key === this.customFields.markEndDateReviewedUser) {
							fldMarkEndDateReviewedUser = fieldData.value;
						}
						if (fieldData.key === this.customFields.markEndDateReviewedTime) {
							fldMarkEndDateReviewedTime = fieldData.value;
						}
					}
				}

				annotationHTML += " <div class='annotator-marginviewer-footer'><h4 class='category-name'>Applied </h4>" + panelButtons + "</div>" +
					userWithCreatedDateHTML +
					" <div class='annotator-marginviewer-text padding-bt-0'><div class='wrap-comment'><p><span class='bold-label'>Deal #(s):</span>  " + fldDealIDs + "</p></div></div>" + annotationTextHTML;

				if (fldMarkEndDatedUser && fldMarkEndDatedTime) {
					fldMarkEndDatedTime = fldMarkEndDatedTime ? $.format.date(new Date(fldMarkEndDatedTime), this.dateFormat) : "";
					annotationHTML += " <div class='annotator-marginviewer-text padding-tp-bt-0'><div class='user-date'><span class='bold-label'>End Dated: </span><p class='annotation-author'>" + fldMarkEndDatedUser + " </p><p class='annotation-date'> " + fldMarkEndDatedTime + "</p></div><div>";
				}
				if (fldMarkReviewedUser && fldMarkReviewedTime) {
					fldMarkReviewedTime = fldMarkReviewedTime ? $.format.date(new Date(fldMarkReviewedTime), this.dateFormat) : "";
					annotationHTML += " <div class='annotator-marginviewer-text padding-tp-bt-0'><div class='user-date'><span class='bold-label'>Reviewed: </span><p class='annotation-author'>" + fldMarkReviewedUser + "</p><p class='annotation-date'>" + fldMarkReviewedTime + "</p></div></div";
				}
				if (fldMarkEndDateReviewedUser && fldMarkEndDateReviewedTime) {
					fldMarkEndDateReviewedTime = fldMarkEndDateReviewedTime ? $.format.date(new Date(fldMarkEndDateReviewedTime), this.dateFormat) : "";
					annotationHTML += " <div class='annotator-marginviewer-text padding-tp-bt-0'><div class='user-date'><span class='bold-label'>End Date Reviewed: </span><p class='annotation-author'>" +
						fldMarkEndDateReviewedUser + "</p><p class='annotation-date'> " + fldMarkEndDateReviewedTime + "</p></div></div>";
				}



				// Handle Clear Stuck Annotations
			} else if (annotation.category === "clearstuck") {
				var fldStuckReason = "",
					fldClearStuckUser = null,
					fldClearStuckTime = null;

				for (var i = 0; i < customDataLength; i++) {
					fieldData = customData[i];
					if (fieldData && fieldData.key) { //value
						if (fieldData.key === this.customFields.markStuckClearedUser) {
							fldClearStuckUser = fieldData.value;
						}
						if (fieldData.key === this.customFields.markStuckClearedTime) {
							fldClearStuckTime = fieldData.value;
						}
						if (fieldData.key === this.customFields.stuckReason) {
							fldStuckReason = fieldData.value;
						}
					}
				}
				fldClearStuckTime = fldClearStuckTime ? $.format.date(new Date(fldClearStuckTime), this.dateFormat) : "";
				//panelButtons = "";

				annotationHTML += " <div class='annotator-marginviewer-footer'><h4 class='category-name'>Cleared:</h4><p class='stuck-reason'>" + fldStuckReason + panelButtons + "</p></div>" +
					userWithCreatedDateHTML + annotationTextHTML +
					" <div class='annotator-marginviewer-text padding-tp-bt-0'><div class='cleared-stuck-infor user-date'><span class='bold-label'>Cleared:</span><p class='annotation-author'>" + fldClearStuckUser + "</p><p class='annotation-date'> " + fldClearStuckTime + "</p></div></div>";

				// Handle Add Note Annotations
			} else if (annotation.category === "subratllat") {
				annotationHTML += " <div class='annotator-marginviewer-footer'><h4 class='category-name'>Note </h4>" + panelButtons + "</div>" + userWithCreatedDateHTML + annotationTextHTML;
			}

			if (!isUpdate) {
				// Place all elements in a list item
				annotationHTML = "<li class='annotator-marginviewer-element " + this.cssClasses.border[annotation.category] + "' data-type='" +
					annotation.category + "' id='" + "annotation-" + annotation.id + "'>" + annotationHTML + "</li>";
			}


			return annotationHTML;
		};

		AnnotatorViewer.prototype.createAnnotationPanel = function (annotation) {
			//william:
			return '<div  class="annotations-list-uoc cat-sideviewer-panel-container"><div id="annotations-panel"></div><div id="anotacions-uoc-panel cat-sideviewer-panel"><ul class="container-anotacions"></ul></div></div>';
		};


		AnnotatorViewer.prototype.createReferenceAnnotation = function (annotation) {
			var annotator = this.annotator,
			    anotation_reference = null,
			    annotationHTML = this.constructAnnotation(annotation);
			
			if (annotation.id != null) {
				anotation_reference = "annotation-" + annotation.id;
			} else {
				anotation_reference = "annotator-temp";
			}

			var annotationObject = $(annotationHTML).appendTo('.container-anotacions')
				.mouseover(function () {
					if (annotator && annotator.plugins.AnnotoriousImagePlugin) {
						annotator.publish('onReferenceAnnotationMouseOver', annotation);
					}
				})
				.mouseout(function () {
					if (annotator && annotator.plugins.AnnotoriousImagePlugin) {
						annotator.publish('onReferenceAnnotationMouseOut', annotation);
					}
				});

			$('#' + anotation_reference).data('annotation', annotation);
			$(annotationObject).fadeIn('fast');
		};

		return AnnotatorViewer;

	})(Annotator.Plugin);

}).call(this);