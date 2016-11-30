(function () {
	var __slice = [].slice,
		__bind = function (fn, me) {
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
		},
		__indexOf = [].indexOf || function (item) {
			for (var i = 0, l = this.length; i < l; i++) {
				if (i in this && this[i] === item) return i;
			}
			return -1;
		},
		$ = jQuery;

	Annotator.Plugin.AnnotationStore = (function (_super) {

		__extends(AnnotationStore, _super);

		AnnotationStore.prototype.events = {
			'annotationCreated': 'annotationCreated',
			'annotationDeleted': 'annotationDeleted',
			'annotationUpdated': 'annotationUpdated'
		};

		AnnotationStore.prototype.options = {
			onAnnotationStoreApiRequest: function () {},
			annotationData: {},
			emulateHTTP: false,
			loadFromSearch: false
		};

		function AnnotationStore(element, options) {
			this._onLoadAnnotationsFromSearch = __bind(this._onLoadAnnotationsFromSearch, this);
			this._onLoadAnnotations = __bind(this._onLoadAnnotations, this);
			this._getAnnotations = __bind(this._getAnnotations, this);
			AnnotationStore.__super__.constructor.apply(this, arguments);
			this.annotations = [];
		}

		AnnotationStore.prototype.pluginInit = function () {
			if (!Annotator.supported()) {
				return;
			}
			if (this.annotator.plugins.Auth) {
				return this.annotator.plugins.Auth.withToken(this._getAnnotations);
			} else {
				return this._getAnnotations();
			}
		};

		AnnotationStore.prototype._getAnnotations = function () {
			if (this.options.loadFromSearch) {
				return this.loadAnnotationsFromSearch(this.options.loadFromSearch);
			} else {
				return this.loadAnnotations();
			}
		};

		AnnotationStore.prototype.annotationCreated = function (annotation) {
			if (__indexOf.call(this.annotations, annotation) < 0) {
				this.registerAnnotation(annotation);
				return this._apiRequest('create', annotation, (function (_this) {
					return function (data) {
						if (data.id == null) {
							console.warn(Annotator._t("Warning: No ID returned from server for annotation "), annotation);
						} else {
							annotation.id = data.id;
							$("#id-annotator-temp").attr('id', annotation.id);
							$("#annotator-temp").attr('id', 'annotation-' + annotation.id);
							$("#annotation-" + annotation.id).children(".annotator-marginviewer-quote").show();
						}
						return _this.updateAnnotation(annotation, data, true);
					};
				})(this));
			} else {
				return this.updateAnnotation(annotation, {});
			}
		};

		AnnotationStore.prototype.annotationUpdated = function (annotation) {
			if (__indexOf.call(this.annotations, annotation) >= 0) {
				return this._apiRequest('update', annotation, ((function (_this) {
					return function (data) {
						return _this.updateAnnotation(annotation, data, false);
					};
				})(this)));
			}
		};

		AnnotationStore.prototype.annotationDeleted = function (annotation) {
			if (__indexOf.call(this.annotations, annotation) >= 0) {
				return this._apiRequest('destroy', annotation, ((function (_this) {
					return function () {
						return _this.unregisterAnnotation(annotation);
					};
				})(this)));
			}
		};

		AnnotationStore.prototype.registerAnnotation = function (annotation) {
			return this.annotations.push(annotation);
		};

		AnnotationStore.prototype.unregisterAnnotation = function (annotation) {
			this.annotator.publish('annotationDeletedOnServer', annotation);
			return this.annotations.splice(this.annotations.indexOf(annotation), 1);
		};

		AnnotationStore.prototype.updateAnnotation = function (annotation, data, isCreated) {
			if (__indexOf.call(this.annotations, annotation) < 0) {
				console.error(Annotator._t("Trying to update unregistered annotation!"));
			} else {
				$.extend(annotation, data);
			}
			if (typeof isCreated === "boolean") {
				if (isCreated) {
					this.annotator.publish('annotationCreatedOnServer', annotation);
				} else {
					this.annotator.publish('annotationUpdatedOnServer', [annotation, this.annotations]);
				}
			}
			return $(annotation.highlights).data('annotation', annotation);
		};

		AnnotationStore.prototype.loadAnnotations = function () {
			return this._apiRequest('read', null, this._onLoadAnnotations);
		};

		AnnotationStore.prototype._onLoadAnnotations = function (data) {
			var a, annotation, annotationMap, newData, _k, _l, _len2, _len3, _ref2;
			if (data == null) {
				data = [];
			}
			annotationMap = {};
			_ref2 = this.annotations;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				a = _ref2[_k];
				annotationMap[a.id] = a;
			}
			newData = [];
			for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
				a = data[_l];
				if (annotationMap[a.id]) {
					annotation = annotationMap[a.id];
					this.updateAnnotation(annotation, a);
				} else {
					newData.push(a);
				}
			}
			this.annotations = this.annotations.concat(newData);
			return this.annotator.loadAnnotations(newData.slice());
		};

		AnnotationStore.prototype.loadAnnotationsFromSearch = function (searchOptions) {
			return this._apiRequest('search', searchOptions, this._onLoadAnnotationsFromSearch);
		};

		AnnotationStore.prototype._onLoadAnnotationsFromSearch = function (data) {
			if (data == null) {
				data = {};
			}
			return this._onLoadAnnotations(data || []);
		};

		AnnotationStore.prototype.dumpAnnotations = function () {
			var ann, _k, _len2, _ref2, _results;
			_ref2 = this.annotations;
			_results = [];
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				ann = _ref2[_k];
				_results.push(JSON.parse(this._dataFor(ann)));
			}
			return _results;
		};

		AnnotationStore.prototype._apiRequest = function (action, obj, onSuccess) {
			if (this.options.onAnnotationStoreApiRequest) {
				this.options.onAnnotationStoreApiRequest(action, obj, onSuccess);
			} else {
				this.annotator.publish('annotationStoreApiRequest', [action, obj, onSuccess]);
			}
		};

		AnnotationStore.prototype._dataFor = function (annotation) {
			var data, highlights;
			highlights = annotation.highlights;
			delete annotation.highlights;
			$.extend(annotation, this.options.annotationData);
			data = JSON.stringify(annotation);
			if (highlights) {
				annotation.highlights = highlights;
			}
			return data;
		};

		return AnnotationStore;

	})(Annotator.Plugin);

}).call(this);