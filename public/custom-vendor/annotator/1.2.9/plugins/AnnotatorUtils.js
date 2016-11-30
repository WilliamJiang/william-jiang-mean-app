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

	Annotator.Plugin.AnnotatorUtils = (function (_super) {
		__extends(AnnotatorUtils, _super);

		AnnotatorUtils.prototype.events = {
			'annotationsLoaded': 'onAnnotationsLoaded',
			'annotationCreatedOnServer': 'onAnnotationCreated',
			'annotationDeletedOnServer': 'onAnnotationDeleted',
			'annotationUpdatedOnServer': 'onAnnotationUpdated'
		};


		AnnotatorUtils.prototype.field = null;

		AnnotatorUtils.prototype.input = null;

		AnnotatorUtils.prototype.options = {
			AnnotatorUtils: {}
		};

		var $ = jQuery.noConflict();

		function AnnotatorUtils(element, options) {
			this.onAnnotationsLoaded = __bind(this.onAnnotationsLoaded, this);
			this.onAnnotationCreated = __bind(this.onAnnotationCreated, this);
			this.onAnnotationUpdated = __bind(this.onAnnotationUpdated, this);
			this.onAnnotationDeleted = __bind(this.onAnnotationDeleted, this);
			options = options ||{};
			this.annotationToHighlight = options.annotationToHighlight;

			AnnotatorUtils.__super__.constructor.apply(this, arguments);
		};

		AnnotatorUtils.prototype.pluginInit = function () {
			var cat, color, i, isChecked, _ref;
			if (!Annotator.supported()) {
				return;
			}
		};

		AnnotatorUtils.prototype.onAnnotationCreated = function (annotation) {};

		AnnotatorUtils.prototype.onAnnotationUpdated = function (annotation) {};

		AnnotatorUtils.prototype.onAnnotationsLoaded = function (annotations) {
			// Highlight the annotation here
			//this.annotationToHighlight

		};

		AnnotatorUtils.prototype.onAnnotationDeleted = function (annotation) {};

		return AnnotatorUtils;

	})(Annotator.Plugin);

}).call(this);