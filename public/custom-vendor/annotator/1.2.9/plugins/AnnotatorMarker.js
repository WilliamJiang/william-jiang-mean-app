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

	Annotator.Plugin.AnnotatorMarker = (function (_super) {
		__extends(AnnotatorMarker, _super);

		AnnotatorMarker.prototype.events = {
			'annotationsLoaded': 'onAnnotationsLoaded',
			'annotationCreatedOnServer': 'onAnnotationCreated',
			'annotationDeletedOnServer': 'onAnnotationDeleted',
			'annotationUpdatedOnServer': 'onAnnotationUpdated'
		};

		AnnotatorMarker.prototype.field = null;

		AnnotatorMarker.prototype.input = null;

		AnnotatorMarker.prototype.options = {
			AnnotatorMarker: {}
		};

		var $ = jQuery.noConflict();

		function AnnotatorMarker(element, options) {
			options = options || {};
			this.onAnnotationCreated = __bind(this.onAnnotationCreated, this);
			this.onAnnotationUpdated = __bind(this.onAnnotationUpdated, this);
			this.annotationCategories = {
				Stuck: "errata",
				StuckCleared: "clearstuck",
				MarkApplied: "destacat"
			};
			this.markerEvents = {
				load: "load",
				create: "create",
				update: "update",
				delete: "delete"
			};
			this.markerEventHandlers = options.markerEventHandlers;
			this.stuckMarkCount = 0;
			this.notReviewedCount = 0;
			this.MarkAsAppliedCount = 0;
			AnnotatorMarker.__super__.constructor.apply(this, arguments);
		};

		AnnotatorMarker.prototype.pluginInit = function () {
			if (!Annotator.supported()) {
				return;
			}
		};

		AnnotatorMarker.prototype.destroy = function () {
			this.markerEventHandlers = {};
			this.stuckMarkCount = 0;
			this.notReviewedCount = 0;
			this.MarkAsAppliedCount = 0;
		};

		AnnotatorMarker.prototype.onAnnotationCreated = function (annotation) {
			if (annotation && annotation.category) {
				if (annotation.category === this.annotationCategories.Stuck) {
					this.stuckMarkCount++;
					console.log("Annotation Created stuckMarkCount " + this.stuckMarkCount);
				}else if (annotation.category === this.annotationCategories.MarkApplied) {
					if(annotation.hasOwnProperty("reviewed") && !annotation.reviewed){
						this.notReviewedCount++;
//						console.log("Annotation Created notReviewedCount " + this.notReviewedCount);
					}
					
					this.MarkAsAppliedCount++;
//					console.log("Annotation Created MarkAsAppliedCount " + this.MarkAsAppliedCount);
				}

				this.checkAnnotationStatus(this.markerEvents.create, annotation.category);
			}
		};

		AnnotatorMarker.prototype.onAnnotationUpdated = function (annotation, annotations) {
			if (annotation && annotation.category) {
				if (annotation.category === this.annotationCategories.StuckCleared || annotation.category === this.annotationCategories.Stuck
						|| annotation.category === this.annotationCategories.MarkApplied) {
					this.onAnnotationsLoaded(annotations, true);
				}

				this.checkAnnotationStatus(this.markerEvents.update, annotation.category);
			}

		};

		AnnotatorMarker.prototype.onAnnotationTypeCleared = function (annotation) {
			if (annotation && annotation.category) {
				if (annotation.category === this.annotationCategories.StuckCleared) {
					this.stuckMarkCount--;
//					console.log("Annotation Cleared Count " + this.stuckMarkCount);
				}

				this.checkAnnotationStatus(this.markerEvents.update, annotation.category);
			}

		};

		AnnotatorMarker.prototype.onAnnotationsLoaded = function (annotations, onUpdate) {
			var that = this;
			this.stuckMarkCount = 0;
			this.notReviewedCount = 0;
			if(!onUpdate){
				this.MarkAsAppliedCount = 0;
			}
			if (annotations && annotations.length > 0) {
				$.each(annotations, function (ind, annotation) {
					if (annotation.category && annotation.category === that.annotationCategories.Stuck) {
						that.stuckMarkCount++;
//						console.log("Annotation loaded stuckMarkCount " + that.stuckMarkCount);
					}else if (annotation.category && annotation.category === that.annotationCategories.MarkApplied) {
						if(annotation.hasOwnProperty("reviewed") && !annotation.reviewed){
							that.notReviewedCount++;
//							console.log("Annotation notReviewedCount Count " + that.notReviewedCount);
						}
					}
				});
				if(!onUpdate){
					this.checkAnnotationStatus(this.markerEvents.load);				
				}			
			}
		};

		AnnotatorMarker.prototype.onAnnotationDeleted = function (annotation) {
			if (annotation && annotation.category) {
				if (annotation.category === this.annotationCategories.Stuck) {
					this.stuckMarkCount--;
					console.log("Annotation removed stuckMarkCount " + this.stuckMarkCount);
				}else if (annotation.category === this.annotationCategories.MarkApplied) {
					if(annotation.hasOwnProperty("reviewed") && !annotation.reviewed){
						this.notReviewedCount--;
//						console.log("Annotation Created notReviewedCount " + this.notReviewedCount);
					}
					this.MarkAsAppliedCount--;
//					console.log("Annotation Created MarkAsAppliedCount " + this.MarkAsAppliedCount);
				}

				this.checkAnnotationStatus(this.markerEvents.delete, annotation.category);
			}

		};

		AnnotatorMarker.prototype.checkAnnotationStatus = function (event, category) {
			if (event && this.markerEventHandlers && this.markerEventHandlers[event]) {
				return this.markerEventHandlers[event]({
					stuckMarkCount: this.stuckMarkCount,
					notReviewedCount: this.notReviewedCount,
					MarkAsAppliedCount: this.MarkAsAppliedCount,
					event: event,
					category: category
				});
			}
		};

		return AnnotatorMarker;

	})(Annotator.Plugin);

}).call(this);