(function () {

	var __slice = [].slice,
		__hasProp = {}.hasOwnProperty,
		__extends = function (child, parent) {
			var key = null;
			for (key in parent) {
				if (__hasProp.call(parent, key)) {
					child[key] = parent[key];
				}
			}

			function ctor() {
				this.constructor = child;
			}
			ctor.prototype = parent.prototype;
			child.prototype = new ctor();
			child.__super__ = parent.prototype;
			return child;
		},
		__bind = function (fn, me) {
			return function () {
				return fn.apply(me, arguments);
			};
		},
		__indexOf = [].indexOf || function (item) {
			for (var i = 0, l = this.length; i < l; i++) {
				if (i in this && this[i] === item) return i;
			}
			return -1;
		};

	Annotator.Plugin.Categories = (function (_super) {
		__extends(Categories, _super);
		var $ = jQuery.noConflict();

		Categories.prototype.events = {
			"annotationEditorShown": "onAnnotationEditorShown",
			"annotationEditorSubmit": "onAnnotationEditorSubmit",
			'annotationEditorHidden': 'onAnnotationEditorHidden',			
			'annotationsLoaded': 'onAnnotationsLoaded',
			'annotationCreatedOnServer': 'onAnnotationCreated',
			'annotationUpdatedOnServer': 'onAnnotationUpdated',

			'#radio-errata click': 'categoryChanged',
			'#radio-destacat click': 'categoryChanged',
			'#radio-subratllat click': 'categoryChanged'
		};

		Categories.prototype.field = null;

		Categories.prototype.input = null;

		Categories.prototype.options = {
			categories: {}
		};

		function Categories(element, options) {
			this.onAnnotationEditorSubmit = __bind(this.onAnnotationEditorSubmit, this);
			this.onAnnotationEditorShown = __bind(this.onAnnotationEditorShown, this);
			this.updateViewer = __bind(this.updateViewer, this);
			this.onAnnotationEditorHidden = __bind(this.onAnnotationEditorHidden, this);
			this.enableOrDisableSubmit = __bind(this.enableOrDisableSubmit, this);			
			this.onAnnotationsLoaded = __bind(this.onAnnotationsLoaded, this);
			this.onAnnotationCreated = __bind(this.onAnnotationCreated, this);
			this.onAnnotationUpdated = __bind(this.onAnnotationUpdated, this);

			options = options || {};
			this.options.categories = options.categories;
			this.categoryChanged = __bind(this.categoryChanged, this);			
			this.currUser = options.user;
			this.getCI = options.getCI;
			this.baseTemplateUrl = "../../custom-vendor/annotator/1.2.9/plugins/templates/";
			this.Templates = {};
			this.dateFormat = "MMM dd  hh:mm a";
			this.ClearStuckCategory = "clearstuck";
			this.StuckCategory = "errata";
			this.styles = {
					// Styles to Annotation rectangle on image. Currently works only for the border
					annotationShape: {
						clearstuck: {
			                hi_fill : "#485662",
			                hi_stroke : "#485662",
			                hi_outline : "#485662",
			                hi_outline_width :"3",
			                hi_stroke_width : "2.5",
			
			                fill : "#485662",
			                stroke : "#485662",
			                outline : "#485662",
			                outline_width : "3",
			                stroke_width : "2.5"
		               },
						errata: {
			                hi_fill : "#8f83fc",
			                hi_stroke : "#8f83fc",
			                hi_outline : "#8f83fc",
			                hi_outline_width :"3",
			                hi_stroke_width : "2.5",
			
			                fill : "#8f83fc",
			                stroke : "#8f83fc",
			                outline : "#8f83fc",
			                outline_width : "3",
			                stroke_width : "2.5"
		               },
						destacat: {
			                hi_fill : "#00a651",
			                hi_stroke : "#00a651",
			                hi_outline : "#00a651",
			                hi_outline_width :"3",
			                hi_stroke_width : "2.5",
			
			                fill : "#00a651",
			                stroke : "#00a651",
			                outline : "#00a651",
			                outline_width : "3",
			                stroke_width : "2.5"
		               },
						subratllat: {
			                hi_fill : "#f5b300",
			                hi_stroke : "#f5b300",
			                hi_outline : "#f5b300",
			                hi_outline_width :"3",
			                hi_stroke_width : "2.5",
			
			                fill : "#f5b300",
			                stroke : "#f5b300",
			                outline : "#f5b300",
			                outline_width : "3",
			                stroke_width : "2.5"
		               }
					}
			};
			this.cssClasses = {
				border: {
					clearstuck: "is-clearstuck",
					errata: "is-stuck",
					destacat: "is-mark",
					subratllat: "is-note"
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
				clearStuckComments: "ClearStuckComments",
				markStuckClearedOnViewer: "MarkStuckClearedOnViewer",
				sendNotification: "SendNotification",
				notifyEmailIDs: "NotifyEmailIDs",

				annotationCommentTextArea: "annotationCommentTextArea"
			};
			this.stuckReasons = [{
					value: "Missing asset",
					name: "Missing asset"
				},
				{
					value: "Missing clearance",
					name: "Missing clearance"
				},
				{
					value: "Missing units",
					name: "Missing units"
				},
				{
					value: "Need revised instruction",
					name: "Need revised instruction"
				},
				{
					value: "other",
					name: "other"
				}];
			
			this.getTemplates();

			Categories.__super__.constructor.apply(this, arguments);
		}

		Categories.prototype.pluginInit = function () {
			if (!Annotator.supported()) {
				return;
			}

			this.annotator.viewer.addField({
				load: this.updateViewer
			});
		};
		
		Categories.prototype.getTemplates = function (callback) {
			var templates = ["categories.html", "clearstuck_viewer.html", 
			                 "stuck_clear.html", "stuck_viewer.html",
			                 "markapplied_edit_viewer.html", "clearstuck_edit.html", "note_edit.html", "stuck_edit.html"],
			    counter = 0, that = this;
			
			templates.forEach(function(tmplName){
				that.getTemplate(tmplName, function(){
					counter ++;
					if(counter === templates.length && callback){
						callback();
					}
				});
			})
			
		}

		Categories.prototype.getTemplate = function (tmplName, callback) {
			var tmplPath = this.baseTemplateUrl + tmplName,
				body = $("body"),
				annotationData = body.data("annotationData"),
				that = this;
			if (annotationData && annotationData.annotationTemplates && annotationData.annotationTemplates[tmplPath]) {
				return callback(annotationData.annotationTemplates[tmplPath]);
			} else {
				if(!annotationData){
					body.data("annotationData", {annotationTemplates: {}});
				}
				$.get(tmplPath, function (data) {
					annotationData = body.data("annotationData");
					annotationData.annotationTemplates[tmplPath] = _.template(data);
					body.data("annotationData", annotationData);
					return callback(annotationData.annotationTemplates[tmplPath]);
				});
			}

		}
		
		Categories.prototype.addAnnotationShapeStyle = function (annotation) {
			if (annotation.category && annotation.shapes && annotation.shapes instanceof Array && annotation.shapes.length != 0) {
				annotation.shapes[0].style = this.styles.annotationShape[annotation.category];
			}
		}

		Categories.prototype.updateViewer = function (field, annotation, controls) {

			var _categories = this.options.categories,
				createdUser = annotation.user ? annotation.user : "",
				createdDate = annotation.createdDate ? new Date(annotation.createdDate) : new Date(),
				markAppliedForm = "",
				that = this;
			field = $(field);

			return that.createCategoryData(annotation.category, annotation, field, true);

		};		

		Categories.prototype.onAnnotationCreated = function (annotation) {
			if(annotation){
				this.addAnnotationShapeStyle(annotation);
			}
		};

		Categories.prototype.onAnnotationUpdated = function (annotation) {
			if(annotation){
				this.addAnnotationShapeStyle(annotation);
			}
		};

		Categories.prototype.onAnnotationsLoaded = function (annotations) {
			if(annotations){
				var that = this;
				annotations.forEach(function(annotation){
					if(annotation){
						that.addAnnotationShapeStyle(annotation);
			        }
				})	
			}
		};

		Categories.prototype.onAnnotationEditorHidden = function (editor, annotation) {
			if (annotation && annotation.hasOwnProperty(this.customFields.markStuckCleared)) {
				delete annotation[this.customFields.markStuckCleared];
			}

			if (annotation && annotation.hasOwnProperty(this.customFields.markEndDated)) {
				delete annotation[this.customFields.markEndDated];
			}
			if (annotation && annotation.hasOwnProperty(this.customFields.markReviewed)) {
				delete annotation[this.customFields.markReviewed];
			}
			if (annotation && annotation.hasOwnProperty(this.customFields.markEndDateReviewed)) {
				delete annotation[this.customFields.markEndDateReviewed];
			}
		}

		Categories.prototype.addCustomData = function (key, value, annotation) {
			var customDataField = {};
			if (!annotation) {
				annotation = {};
			}
			if (!annotation.customData) {
				annotation.customData = [];
			}

			customDataField.key = key;
			customDataField.value = value;
			annotation.customData.push(customDataField);

			return annotation;
		}
		
		Categories.prototype.addCustomDataOnApplied = function (annotation) {
			if (!annotation) {
				annotation = {};
			}
			if (!annotation.customData) {
				annotation.customData = [];
			}
			if(!annotation.customFields){
				annotation.customFields = {};
			}
			
			var customData = annotation.customData,
			    customDataLength = customData.length,
			    fieldData = null,
				fldMarkEndDatedUser = null,
				fldMarkEndDatedTime = null,
				fldMarkReviewedUser = null,
				fldMarkReviewedTime = null,
				fldMarkEndDateReviewedUser = null,
				fldMarkEndDateReviewedTime = null;
			
			for (var i = 0; i < customDataLength; i++) {
				fieldData = customData[i];
				if (fieldData && fieldData.key) { //value

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
			
			var isEndDated = fldMarkEndDatedUser && fldMarkEndDatedTime,
			    isReviewed = fldMarkReviewedUser && fldMarkReviewedTime,
			    isEnddateReviewed = fldMarkEndDateReviewedUser && fldMarkEndDateReviewedTime;
			
			if(isEndDated){
				annotation.customFields.markedAsEndDated = true;
				if(isReviewed){
					annotation.customFields.markedAsReviewedBeforeEndDate = true;
					if(new Date(fldMarkReviewedTime) > new Date(fldMarkEndDatedTime)){
						annotation.reviewed = true;						
					}else{
						annotation.reviewed = false;	
					}				
					
				}else{
					annotation.customFields.markedAsReviewedBeforeEndDate = false;
				}
				
				if(isEnddateReviewed){
					annotation.customFields.markedAsReviewedAfterEndDate = true;
					annotation.reviewed = true;
				}else{
					annotation.customFields.markedAsReviewedAfterEndDate = false;
				}
				
				if(!isReviewed && !isEnddateReviewed){
					annotation.reviewed = false;
					annotation.customFields.markedAsReviewedAfterEndDate = false;
					annotation.customFields.markedAsReviewedBeforeEndDate = false;
				}

			}else{
				if(isReviewed){
					annotation.customFields.markedAsReviewedBeforeEndDate = true;
					annotation.reviewed = true;					
				}else{
					annotation.customFields.markedAsReviewedBeforeEndDate = false;
					annotation.reviewed = false;	
				}
			}

			return annotation;
		}
		
		Categories.prototype.handleSendNotification = function (annotation, stuckReason) {
			var that = this, 
				emailBody = "",
				ci = this.getCI(),
			    emailSubject = getNotificationSubject(),
			    ciUrl = ci && ci.ingest && ci.ingest.files && ci.ingest.files.common? ci.ingest.files.common.url:"";
			
            function getNotificationSubject () {
                if (!ci) {
                    return " ";
                }
                var airdateSt = "", airdateEnd = "";
                if (ci.air_date_start) {
                    airdateSt = $.format.date(new Date(ci.air_date_start), "MM/dd/yyyy");
                }
                if (ci.air_date_end) {
                    airdateEnd = $.format.date(new Date(ci.air_date_end), "MM/dd/yyyy");
                }

                return "CI for Network '" + ci.network + "', Advertiser '" + ci.advertiser +
                    "' and air dates '" + airdateSt + " - " + airdateEnd + "'";
            }
            
			if(annotation.category === "errata"){
				if(!stuckReason){stuckReason = {};}
				if(!stuckReason.value){stuckReason.value = "";}
				
				emailBody+="Stuck Reason: " + stuckReason.value + "\n\n";
				emailSubject ="Stuck "+emailSubject;
			}else if(annotation.category === "subratllat"){
				emailSubject ="Note for "+emailSubject;
			}
			emailBody+="Annotation Comment: " + annotation.text + "\n\n" +
			"View CI at: " + ciUrl;
			
			emailBody = encodeURIComponent(emailBody);	
			emailSubject = encodeURIComponent(emailSubject);	
			
			window.location.href = "mailto:?subject=" + emailSubject + "&body=" + emailBody;
		}

		//Section order and section title (annotationEditorSubmit)
		Categories.prototype.onAnnotationEditorSubmit = function (editor, annotation) {
			//Assign a category to the annotation

			var stuckReason = null,
				emailBody = "",
				clearStuck = false,
				notifyStuck = false,
				notifyChange = false,
				clearStuckUser = null,
				clearStuckTime = null,
				clearStuckComments = null,

				fieldData = null,
				fldMarkEndDatedUser = null,
				fldMarkEndDatedTime = null,
				fldMarkReviewedUser = null,
				fldMarkReviewedTime = null,
				fldMarkEndDateReviewedUser = null,
				fldMarkEndDateReviewedTime = null,

				customData = null,
				customDataLength = 0,
				markedAsEndDatedCB = null,
				markedAsReviewedCB = null,
				markedAsEndDateReviewedCB = null,
				markedAsEndDated = false,
				markedAsReviewed = false,
				markedAsEndDateReviewed = false,
				
				isEdit = false;

			annotation = annotation? annotation: {};
			if(!annotation.category || annotation.category !== this.ClearStuckCategory){
				annotation.category = $('input:radio[name=categories-annotation]:checked').val();
			}

			//Custom Fields related to Categories
			if (!annotation.customFields) {
				annotation.customFields = {
					category: annotation.category
				};
			}

			if (!annotation.createdDate) {
				annotation.createdDate = new Date();
			}
			annotation.updatedDate = new Date();
			
			if(annotation.customFields.markedUser && annotation.customFields.markedDate){
				isEdit = true;
			}

			if (!annotation.customFields.markedUser) {
				annotation.customFields.markedUser = this.currUser;
			}
			if (!annotation.customFields.markedDate) {
				annotation.customFields.markedDate = new Date();
			}

			if (annotation.category) {
				if (!annotation.customData) {
					annotation.customData = [];
				}

				switch (annotation.category) {
				case 'clearstuck':
					//Clear Stuck
					customData = annotation.customData;
					customDataLength = customData.length;
					
					clearStuck = $("#" + annotation.category + this.customFields.markStuckCleared).prop('checked');
					if (! clearStuck) {

						while (customDataLength--) {
							fieldData = customData[customDataLength];
							if (fieldData && fieldData.key) { //value
								if (fieldData.key === this.customFields.markStuckClearedUser) {
									customData.splice(customDataLength, 1);
								}
								if (fieldData.key === this.customFields.markStuckClearedTime) {
									customData.splice(customDataLength, 1);
								}
								if (fieldData.key === this.customFields.clearStuckComments) {
									customData.splice(customDataLength, 1);
								}
							}
						}
						
						// Do after executing above steps to work with jQuery selector correctly
						annotation.category = this.StuckCategory;
					}else {
						while (customDataLength--) {
							fieldData = customData[customDataLength];
							if (fieldData && fieldData.key) { //value
								if (fieldData.key === this.customFields.clearStuckComments) {
									customData.splice(customDataLength, 1);
								}
							}
						}
						this.addCustomData(this.customFields.clearStuckComments, $("#" + annotation.category + this.customFields.clearStuckComments).val(), annotation);
					}

					break;
				case 'errata':

					clearStuck = $("#" + annotation.category + this.customFields.markStuckCleared).prop('checked');
					if (clearStuck) {
						this.addCustomData(this.customFields.markStuckClearedUser, this.currUser, annotation);
						this.addCustomData(this.customFields.markStuckClearedTime, new Date(), annotation);
						this.addCustomData(this.customFields.clearStuckComments, $("#" + annotation.category + this.customFields.clearStuckComments).val(), annotation);

						// Do after executing above steps to work with jQuery selector correctly
						annotation.category = this.ClearStuckCategory;
					} else {
						// Save annotation Text
						annotation.text = $("#" + annotation.category + this.customFields.annotationCommentTextArea).val();
						emailBody = "";
						notifyStuck = $("#" + annotation.category + this.customFields.sendNotification).prop('checked');
						if(!isEdit){
							annotation.customData = [];
							stuckReason = {
									value: $("#" + annotation.category + this.customFields.stuckReason).val()
							};
							this.addCustomData(this.customFields.stuckReason, stuckReason.value, annotation);
						}else{
							customData = annotation.customData;
							customDataLength = customData.length;
							
							for (var i = 0; i < customDataLength; i++) {
								fieldData = customData[i];
								if (fieldData && fieldData.key) { //value
									if (fieldData.key === this.customFields.stuckReason) {
										stuckReason = {
												value: fieldData.value
										};
										break;
									}
								}
							}
						}

						if (notifyStuck) {
							if (!stuckReason.value) {
								stuckReason.value = "";
							}
							this.handleSendNotification(annotation, stuckReason);
						}
					}

					break;
				case 'destacat':

					// Save annotation Text
					if($("#" + annotation.category + this.customFields.annotationCommentTextArea).length !==0){
						annotation.text = $("#" + annotation.category + this.customFields.annotationCommentTextArea).val();
					}					

					customData = annotation.customData;
					customDataLength = customData.length;
					markedAsEndDatedCB = $("#" + annotation.category + this.customFields.markEndDated);
					markedAsReviewedCB = $("#" + annotation.category + this.customFields.markReviewed);
					markedAsEndDateReviewedCB = $("#" + annotation.category + this.customFields.markEndDateReviewed);

					if (markedAsEndDatedCB && markedAsEndDatedCB.length !== 0) {
						markedAsEndDated = markedAsEndDatedCB.prop('checked');
					}

					if (markedAsReviewedCB && markedAsReviewedCB.length !== 0) {
						markedAsReviewed = markedAsReviewedCB.prop('checked');
					}

					if (markedAsEndDateReviewedCB && markedAsEndDateReviewedCB.length !== 0) {
						markedAsEndDateReviewed = markedAsEndDateReviewedCB.prop('checked');
					}

					while (customDataLength--) {
						fieldData = customData[customDataLength];
						if (fieldData && fieldData.key) { //value

							if (fieldData.key === this.customFields.dealIDs && $("#" + annotation.category + this.customFields.dealIDs).length !==0) {
								customData.splice(customDataLength, 1);
							}

							if (fieldData.key === this.customFields.markEndDatedUser) {
								if (markedAsEndDated) {
									fldMarkEndDatedUser = fieldData.value;
								} else {
									if(markedAsEndDatedCB.length !== 0){
										customData.splice(customDataLength, 1);
									}									
								}
							}
							if (fieldData.key === this.customFields.markEndDatedTime) {
								if (markedAsEndDated) {
									fldMarkEndDatedTime = fieldData.value;
								} else {
									if(markedAsEndDatedCB.length !== 0){
										customData.splice(customDataLength, 1);
									}									
								}

							}
							if (fieldData.key === this.customFields.markEndDatedComments && $("#" + annotation.category + this.customFields.markEndDatedComments).length !== 0) {
								customData.splice(customDataLength, 1);
							}

							if (fieldData.key === this.customFields.markReviewedUser) {
								if (markedAsReviewed) {
									fldMarkReviewedUser = fieldData.value;
								} else {
									if(markedAsReviewedCB.length !== 0) {
										customData.splice(customDataLength, 1);
									}									
								}

							}
							if (fieldData.key === this.customFields.markReviewedTime) {
								if (markedAsReviewed) {
									fldMarkReviewedTime = fieldData.value;
								} else {
									if(markedAsReviewedCB.length !== 0) {
										customData.splice(customDataLength, 1);
									}									
								}

							}
							if (fieldData.key === this.customFields.markReviewedComments && $("#" + annotation.category + this.customFields.markReviewedComments).length !== 0) {
								customData.splice(customDataLength, 1);
							}

							if (fieldData.key === this.customFields.markEndDateReviewedUser) {
								if (markedAsEndDateReviewed) {
									fldMarkEndDateReviewedUser = fieldData.value;
								} else {
									if(markedAsEndDateReviewedCB.length !== 0){
										customData.splice(customDataLength, 1);
									}									
								}
							}
							if (fieldData.key === this.customFields.markEndDateReviewedTime) {
								if (markedAsEndDateReviewed) {
									fldMarkEndDateReviewedTime = fieldData.value;
								} else {
									if(markedAsEndDateReviewedCB.length !== 0){
										customData.splice(customDataLength, 1);
									}									
								}

							}
							if (fieldData.key === this.customFields.markEndDateReviewedComments && $("#" + annotation.category + this.customFields.markEndDateReviewedComments).length !== 0) {
								customData.splice(customDataLength, 1);
							}
						}

					}
					
					if($("#" + annotation.category + this.customFields.dealIDs).length !==0){
						var dealIDs = {};
						dealIDs.key = this.customFields.dealIDs;
						dealIDs.value = $("#" + annotation.category + this.customFields.dealIDs).val();
						annotation.customData.push(dealIDs);
					}

					if ((!fldMarkEndDatedUser && !fldMarkEndDatedTime) && markedAsEndDated) {
						this.addCustomData(this.customFields.markEndDatedUser, this.currUser, annotation);
						this.addCustomData(this.customFields.markEndDatedTime, new Date(), annotation);

					}
					if (markedAsEndDated && $("#" + annotation.category + this.customFields.markEndDatedComments).length !== 0) {
						this.addCustomData(this.customFields.markEndDatedComments, $("#" + annotation.category + this.customFields.markEndDatedComments).val(), annotation);
					}

					if ((!fldMarkReviewedUser && !fldMarkReviewedTime) && markedAsReviewed) {
						this.addCustomData(this.customFields.markReviewedUser, this.currUser, annotation);
						this.addCustomData(this.customFields.markReviewedTime, new Date(), annotation);

					}
					if (markedAsReviewed && $("#" + annotation.category + this.customFields.markReviewedComments).length !== 0) {
						this.addCustomData(this.customFields.markReviewedComments, $("#" + annotation.category + this.customFields.markReviewedComments).val(), annotation);
					}

					if ((!fldMarkEndDateReviewedUser && !fldMarkEndDateReviewedTime) && markedAsEndDateReviewed) {
						this.addCustomData(this.customFields.markEndDateReviewedUser, this.currUser, annotation);
						this.addCustomData(this.customFields.markEndDateReviewedTime, new Date(), annotation);

					}
					if (markedAsEndDateReviewed && $("#" + annotation.category + this.customFields.markEndDateReviewedComments).length !== 0) {
						this.addCustomData(this.customFields.markEndDateReviewedComments, $("#" + annotation.category + this.customFields.markEndDateReviewedComments).val(), annotation);
					}
					
					this.addCustomDataOnApplied(annotation);

					break;
				case 'subratllat':
					// Save annotation Text
					annotation.text = $("#" + annotation.category + this.customFields.annotationCommentTextArea).val();

					emailBody = "";
					notifyChange = $("#" + annotation.category + this.customFields.sendNotification).prop('checked');

					if (notifyChange) {
						this.handleSendNotification(annotation);
					}
					break;
				default:
				}
			}

		}

		//Create the categories section inside the editor (annotationEditorShown)
		Categories.prototype.onAnnotationEditorShown = function (editor, annotation) {
			annotation = annotation? annotation: {};
			var _categories = this.options.categories, //Categories plug-in
				editor = $('form.annotator-widget > ul.annotator-listing'), //Place to add categories.
				isEdit = annotation.category,
				that = this,
				categoriesToRender = null;

			function postCategoriesConstruction() {
				if (isEdit) {
					$('li.annotator-radio').hide();
				} else {
					$('li.annotator-radio').show();
					annotation.category = that.firstCategory;
				}
				
				if (isEdit && annotation.category === that.ClearStuckCategory) {
					that.categoryChanged(null, annotation);
				} else{
					$('#radio-' + annotation.category).prop("disabled", false);
					$('#radio-' + annotation.category).prop('checked', true).trigger('click', [annotation]);

					for (cat in _categories) {
						if (isEdit) {
							$('#radio-' + cat).prop("disabled", true);
						} else {
							$('#radio-' + cat).prop("disabled", false);
						}
					}
				}

			}

			if ($('li.annotator-radio').length == 0) { //If the category section doesn't exist
				categoriesToRender = [];
				var i = 1;
				for (cat in _categories) {
					if (cat === this.ClearStuckCategory) {
						continue;
					}
					if (i === 1) {
						this.firstCategory = cat;
					}
					categoriesToRender.push({
						category: cat,
						catStyle: _categories[cat],
						categoryName: i18n_dict[cat]
					});
					i++;

				}

				this.getTemplate("categories.html", function (tmpl) {
					editor.append(tmpl({
						categoriesToRender: categoriesToRender
					}));

					postCategoriesConstruction();

				});

			} else {
				postCategoriesConstruction();
			}

		}

		Categories.prototype.categoryChanged = function (event, annotation) {

			var editor = $('form.annotator-widget > ul.annotator-listing'),
				category = event && event.currentTarget? event.currentTarget.value: null,
				radioFields = $('li.annotator-radio-fields');

			radioFields.remove();
			
			if(!category){
				category = annotation.category;
			}

			return this.createCategoryData(category, annotation, editor, false);
		};

		Categories.prototype.clearStuckCategoryData = function (category, annotation, elem, isViewer) {
			var customData = null,
				customDataLength = 0,
				fieldData = null,
				fldStuckReason = "",
				fldStuckComments = "",
				fldClearStuckComments = "",
				fldClearStuckUser = null,
				fldClearStuckTime = null,
				readOnlyAnnotationText = annotation && annotation.text ? annotation.text : "",
				createdUser = annotation && annotation.user ? annotation.user : "",
				createdDate = annotation && annotation.createdDate ? new Date(annotation.createdDate) : new Date(),
				that = this;

			if (annotation) {
				if (annotation.customData) {
					customData = annotation.customData;
					customDataLength = customData.length;
				}
			}			

			for (var i = 0; i < customDataLength; i++) {
				fieldData = customData[i];
				if (fieldData && fieldData.key) { //value
					if (fieldData.key === this.customFields.markStuckClearedUser) {
						fldClearStuckUser = fieldData.value;
					}
					if (fieldData.key === this.customFields.markStuckClearedTime) {
						fldClearStuckTime = fieldData.value;
					}
					if (fieldData.key === this.customFields.clearStuckComments) {
						fldClearStuckComments = fieldData.value;
					}
					if (fieldData.key === this.customFields.stuckReason) {
						fldStuckReason = fieldData.value;
					}
				}
			}

			if (isViewer) {
				// Hide delete
				$(".annotator-delete").hide();

				this.getTemplate("clearstuck_viewer.html", function (tmpl) {
					return elem.append(tmpl({
						createdUser: createdUser,
						createdDate: $.format.date(createdDate, that.dateFormat),
						readOnlyAnnotationText: readOnlyAnnotationText,
						fldStuckReason: fldStuckReason,
						fldClearStuckUser: fldClearStuckUser,
						fldClearStuckTime: $.format.date(fldClearStuckTime, that.dateFormat),
						fldClearStuckComments: fldClearStuckComments
					}));

				});

			}else{

				this.getTemplate("clearstuck_edit.html", function (tmpl) {
					return elem.append(tmpl({
						createdUser: createdUser,
						createdDate: $.format.date(createdDate, that.dateFormat),
						readOnlyAnnotationText: readOnlyAnnotationText,
						fldStuckReason: fldStuckReason,
						fldClearStuckUser: fldClearStuckUser,
						fldClearStuckTime: $.format.date(fldClearStuckTime, that.dateFormat),
						fldClearStuckComments: fldClearStuckComments,
						markStuckClearedID: category + that.customFields.markStuckCleared,
						clearStuckCommentsID: category + that.customFields.clearStuckComments
					}));

				});
				
			}

		}

		Categories.prototype.stuckCategoryData = function (category, annotation, elem, isViewer) {

			var _value = category,

				customData = null,
				customDataLength = 0,
				fieldData = null,
				fldStuckReason = "",
				fldStuckComments = "",
				fldClearStuckComments = "",
				fldClearStuckUser = null,
				fldClearStuckTime = null,
				stuckReasons = null,
				readOnlyAnnotationText = annotation && annotation.text ? annotation.text : "",
				createdUser = annotation && annotation.user ? annotation.user : null,
				createdDate = annotation && annotation.createdDate ? new Date(annotation.createdDate) : null,
				fldsArray = null,
				that = this;

			if (annotation) {
				if (annotation.customData) {
					customData = annotation.customData;
					customDataLength = customData.length;
				}
			}

			//Stuck
			stuckReasons = this.stuckReasons;

			for (var i = 0; i < customDataLength; i++) {
				fieldData = customData[i];
				if (fieldData && fieldData.key) { //value
					if (fieldData.key === this.customFields.stuckReason) {
						fldStuckReason = fieldData.value;
					}
				}
			}

			if (!isViewer) {

				if (annotation && annotation[this.customFields.markStuckCleared]) {

					this.getTemplate("stuck_clear.html", function (tmpl) {
						return elem.append(tmpl({
							createdUser: createdUser,
							createdDate: $.format.date(createdDate, that.dateFormat),
							readOnlyAnnotationText: readOnlyAnnotationText,
							fldStuckReason: fldStuckReason,
							markStuckClearedID: _value + that.customFields.markStuckCleared,
							clearStuckCommentsID: _value + that.customFields.clearStuckComments
						}));

					});

				} else {

					this.getTemplate("stuck_edit.html", function (tmpl) {
						elem.append(tmpl({
							createdUser: createdUser,
							createdDate: $.format.date(createdDate, that.dateFormat),
							fldStuckReason: fldStuckReason,
							stuckReasons: stuckReasons,
							annotationTextID: _value + that.customFields.annotationCommentTextArea,
							annotationText: readOnlyAnnotationText,
							stuckReasonID: _value + that.customFields.stuckReason,
							sendNotificationID: _value + that.customFields.sendNotification
						}));

						$("#" + _value + that.customFields.stuckReason).val(fldStuckReason);
						that.enableOrDisableSubmit(fldStuckReason);

						$("#" + _value + that.customFields.stuckReason).off("change");
						$("#" + _value + that.customFields.stuckReason).on("change", function () {
							var selVal = $("#" + _value + that.customFields.stuckReason).val();
							that.enableOrDisableSubmit(selVal);
						});

					});

				}

			} else {

				this.getTemplate("stuck_viewer.html", function (tmpl) {
					elem.append(tmpl({
						createdUser: createdUser,
						createdDate: $.format.date(createdDate, that.dateFormat),
						readOnlyAnnotationText: readOnlyAnnotationText,
						fldStuckReason: fldStuckReason,
						markStuckClearedOnViewerID: _value + that.customFields.markStuckClearedOnViewer
					}));

					$("#" + _value + that.customFields.markStuckClearedOnViewer).off("change");
					$("#" + _value + that.customFields.markStuckClearedOnViewer).on("change", function () {
						if ($("#" + _value + that.customFields.markStuckClearedOnViewer).prop('checked')) {
							annotation[that.customFields.markStuckCleared] = true;
							$(".annotator-edit").trigger("click");
						} // else do nothing
					});

				});
			}

		}

		Categories.prototype.markAppliedCategoryData = function (category, annotation, elem, isViewer) {

			var editor = $('form.annotator-widget > ul.annotator-listing'), //Place to add categories.
				_value = category,

				customData = null,
				customDataLength = 0,
				fieldData = null,
				markedUser = null,
				markedDate = null,

				fldDealIDs = "",
				fldMarkEndDatedUser = null,
				fldMarkEndDatedTime = null,
				fldMarkReviewedUser = null,
				fldMarkReviewedTime = null,
				fldMarkEndDateReviewedUser = null,
				fldMarkEndDateReviewedTime = null,
				fldMarkReviewedComments = null,
				fldMarkEndDatedComments = null,
				fldMarkEndDateReviewedComments = null,
				isEdit = false,
				isCreate = false,
				isEndDateNotReviewed = false,
				fldsArray = null,
				readOnlyAnnotationText = annotation && annotation.text ? annotation.text : "",
				createdUser = annotation && annotation.user ? annotation.user : "",
				createdDate = annotation && annotation.createdDate ? new Date(annotation.createdDate) : new Date(),
				
				endDatedOnEditor =false,
				reviewedOnEditor = false,
				endDateReviewedOnEditor = false,
				that = this;
				

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

			isMarked = markedUser && markedDate;
			isEdit = isMarked && !isViewer;

			if (isMarked) {
				fldsArray = [];


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
						if (fieldData.key === this.customFields.markReviewedComments) {
							fldMarkReviewedComments = fieldData.value;
						}
						if (fieldData.key === this.customFields.markEndDatedComments) {
							fldMarkEndDatedComments = fieldData.value;
						}
						if (fieldData.key === this.customFields.markEndDateReviewedComments) {
							fldMarkEndDateReviewedComments = fieldData.value;
						}
					}
				}
				isEndDateNotReviewed = (fldMarkEndDatedUser && fldMarkEndDatedTime) && (fldMarkReviewedUser && fldMarkReviewedTime) &&
					(new Date(fldMarkEndDatedTime) > new Date(fldMarkReviewedTime));

				if (fldMarkEndDatedUser && fldMarkEndDatedTime) {
					fldsArray.push({
						id:"endDated",
						name: "End Dated:",
						user: fldMarkEndDatedUser,
						date: new Date(fldMarkEndDatedTime),
						comments: fldMarkEndDatedComments
					});
				}
				if (fldMarkReviewedUser && fldMarkReviewedTime) {
					fldsArray.push({
						id:"reviewed",
						name: "Reviewed:",
						user: fldMarkReviewedUser,
						date: new Date(fldMarkReviewedTime),
						comments: fldMarkReviewedComments
					});
				}
				if (fldMarkEndDateReviewedUser && fldMarkEndDateReviewedTime) {
					fldsArray.push({
						id:"endDateReviewed",
						name: "End Date Reviewed:",
						user: fldMarkEndDateReviewedUser,
						date: new Date(fldMarkEndDateReviewedTime),
						comments: fldMarkEndDateReviewedComments
					});
				}

				if (fldsArray.length > 0) {
					fldsArray.sort(function (a, b) {
						return a.date - b.date;
					});

					var ind = 0;
					fldsArray.forEach(function (val) {
						val.date = $.format.date(val.date, that.dateFormat);						
						ind++;
						if(ind === fldsArray.length){
							if(val.id === "endDated"){
								endDatedOnEditor =true;								
							}else if(val.id === "reviewed"){
								reviewedOnEditor = true;								
							}else if(val.id === "endDateReviewed"){
								endDateReviewedOnEditor = true;
							}
						}
					})

				}
			}

			this.getTemplate("markapplied_edit_viewer.html", function (tmpl) {

				function handleMarkChangeOnViewer(fieldToRead, fieldToSet) {
					$("#" + _value + fieldToRead).off("change");
					$("#" + _value + fieldToRead).on("change", function () {
						annotation[fieldToSet] = $("#" + _value + fieldToRead).prop('checked');
						$(".annotator-edit").trigger("click");
					});
				}
				elem.append(tmpl({
					isEdit: isEdit,
					isMarked: isMarked,
					createdUser: createdUser,
					createdDate: $.format.date(createdDate, that.dateFormat),
					readOnlyAnnotationText: readOnlyAnnotationText,
					annotationTextID: _value + that.customFields.annotationCommentTextArea,
					annotationText: readOnlyAnnotationText,
					markedUser: markedUser,
					markedDate: markedDate,
					fldsArray: fldsArray,
					isViewer: isViewer,
					dealIDsID: _value + that.customFields.dealIDs,
					fldDealIDs: fldDealIDs,
					markEndDatedID: _value + that.customFields.markEndDated,
					markReviewedID: _value + that.customFields.markReviewed,
					isEndDated: (fldMarkEndDatedUser && fldMarkEndDatedTime),
					isReviewed: (fldMarkReviewedUser && fldMarkReviewedTime),
					isEndDateReviewed: (fldMarkEndDateReviewedUser && fldMarkEndDateReviewedTime),
					isEndDatedOnViewer: annotation.hasOwnProperty(that.customFields.markEndDated),
					isReviewedOnViewer: annotation.hasOwnProperty(that.customFields.markReviewed),
					isEndDateReviewedOnViewer: annotation.hasOwnProperty(that.customFields.markEndDateReviewed),
					endDatedOnEditor: endDatedOnEditor,
					reviewedOnEditor: reviewedOnEditor,
					endDateReviewedOnEditor: endDateReviewedOnEditor,
					fldMarkEndDateReviewedUser: fldMarkEndDateReviewedUser,
					fldMarkEndDateReviewedTime: fldMarkEndDateReviewedTime,
					isEndDateNotReviewed: isEndDateNotReviewed,
					markEndDateReviewedID: _value + that.customFields.markEndDateReviewed,
					markReviewedOnViewerID: _value + that.customFields.markReviewedOnViewer,
					markEndDatedOnViewerID: _value + that.customFields.markEndDatedOnViewer,
					markEndDateReviewedOnViewerID: _value + that.customFields.markEndDateReviewedOnViewer,
					markEndDatedCommentsID: _value + that.customFields.markEndDatedComments,
					markReviewedCommentsID: _value + that.customFields.markReviewedComments,
					markEndDateReviewedCommentsID: _value + that.customFields.markEndDateReviewedComments,
					fldMarkEndDatedComments: fldMarkEndDatedComments,
					fldMarkReviewedComments: fldMarkReviewedComments,
					fldMarkEndDateReviewedComments: fldMarkEndDateReviewedComments
				}));

				if (isMarked) {
					if (isViewer) {
						$("#" + _value + that.customFields.markEndDatedOnViewer).prop('checked', fldMarkEndDatedUser && fldMarkEndDatedTime);
						handleMarkChangeOnViewer(that.customFields.markEndDatedOnViewer, that.customFields.markEndDated);

						$("#" + _value + that.customFields.markReviewedOnViewer).prop('checked', fldMarkReviewedUser && fldMarkReviewedTime);
						handleMarkChangeOnViewer(that.customFields.markReviewedOnViewer, that.customFields.markReviewed);

						if ($("#" + _value + that.customFields.markEndDateReviewedOnViewer).length != 0) {
							$("#" + _value + that.customFields.markEndDateReviewedOnViewer).prop('checked', fldMarkEndDateReviewedUser && fldMarkEndDateReviewedTime);
							handleMarkChangeOnViewer(that.customFields.markEndDateReviewedOnViewer, that.customFields.markEndDateReviewed);
						}

					} else {

						$("#" + _value + that.customFields.dealIDs).val(fldDealIDs);

						if (annotation.hasOwnProperty(that.customFields.markEndDated)) {
							$("#" + _value + that.customFields.markEndDated).prop('checked', annotation[that.customFields.markEndDated]);
						} else {
							$("#" + _value + that.customFields.markEndDated).prop('checked', fldMarkEndDatedUser && fldMarkEndDatedTime);
						}

						if (annotation.hasOwnProperty(that.customFields.markReviewed)) {
							$("#" + _value + that.customFields.markReviewed).prop('checked', annotation[that.customFields.markReviewed]);
						} else {
							$("#" + _value + that.customFields.markReviewed).prop('checked', fldMarkReviewedUser && fldMarkReviewedTime);
						}


						if ($("#" + _value + that.customFields.markEndDateReviewed).length != 0) {
							if (annotation.hasOwnProperty(that.customFields.markEndDateReviewed)) {
								$("#" + _value + that.customFields.markEndDateReviewed).prop('checked', annotation[that.customFields.markEndDateReviewed]);
							} else {
								$("#" + _value + that.customFields.markEndDateReviewed).prop('checked', fldMarkEndDateReviewedUser && fldMarkEndDateReviewedTime);
							}
						}
					}
				}

			});
		}

		Categories.prototype.addBorder = function (category, isViewer) {
			var editor = $(".annotator-editor"),
				viewer = $(".annotator-viewer"),
				cssClasses = this.cssClasses.border;

			function getBorderClass() {

				return cssClasses[category] ? cssClasses[category] : "";
			}

			function removeBorderClass(elem) {
				elem.removeClass(cssClasses.clearstuck);
				elem.removeClass(cssClasses.errata);
				elem.removeClass(cssClasses.destacat);
				elem.removeClass(cssClasses.subratllat);
			}

			if (isViewer) {
				removeBorderClass(viewer);
				viewer.addClass(getBorderClass());
			} else {
				removeBorderClass(editor);
				editor.addClass(getBorderClass());
			}

		}

		Categories.prototype.enableOrDisableSubmit = function (selVal, forceEnable) {

			var annotator = this.annotator,
				saveButton = $(".annotator-save");

			if (!forceEnable && (!selVal || selVal === "")) {
				saveButton.addClass(this.cssClasses.saveDisabled);
				saveButton.attr("href", "");
				annotator.editor._removeEvent("form", "submit", "submit");
				annotator.editor._removeEvent(".annotator-save", "click", "submit");
			} else {
				annotator.editor._removeEvent("form", "submit", "submit");
				annotator.editor._removeEvent(".annotator-save", "click", "submit");

				annotator.editor._addEvent("form", "submit", "submit");
				annotator.editor._addEvent(".annotator-save", "click", "submit");
				saveButton.addClass(this.cssClasses.saveDisabled);
				saveButton.attr("href", "#save");
			}

		}

		Categories.prototype.createCategoryData = function (category, annotation, elem, isViewer) {
			var _value = category,
				that = this;

			if (isViewer) {
				// Show delete
				$(".annotator-delete").show();
			} else {
				this.enableOrDisableSubmit(null, true);
			}
			this.addBorder(category, isViewer);
			annotation = annotation? annotation : {};
			switch (_value) {
			case 'clearstuck':
				//Clear Stuck
				this.clearStuckCategoryData(category, annotation, elem, isViewer);
				break;
			case 'errata':
				//Stuck
				this.stuckCategoryData(category, annotation, elem, isViewer);
				break;
			case 'destacat':
				//Mark Applied
				this.markAppliedCategoryData(category, annotation, elem, isViewer);
				break;
			case 'subratllat':
				//Add Note
				var annotationText = annotation && annotation.text ? annotation.text : "",
					readOnlyAnnotationText = annotationText,
					createdUser = annotation && annotation.user ? annotation.user : null,
					createdDate = annotation && annotation.createdDate ? new Date(annotation.createdDate) : null;

				this.getTemplate("note_edit.html", function (tmpl) {
					elem.append(tmpl({
						isViewer: isViewer,
						createdUser: createdUser,
						createdDate: $.format.date(createdDate, that.dateFormat),
						readOnlyAnnotationText: readOnlyAnnotationText,
						annotationTextID: _value + that.customFields.annotationCommentTextArea,
						annotationText: annotationText,
						sendNotificationID: _value + that.customFields.sendNotification
					}));
				});

				break;
			default:
			}
		}

		return Categories;

	})(Annotator.Plugin);

}).call(this);