/* jshint node:true */
'use strict';

module.exports = function (app) {

    var annotationCtrl = require('../controllers/annotations')(app);

    app.route('/api/annotation/:anId')
        .get(annotationCtrl.getAnnotation);

    app.route('/api/annotation/ci/:ciId')
        .get(annotationCtrl.getAnnotations);

    app.route('/api/annotation/ci/:ciId/page/:pageNum')
        .get(annotationCtrl.getAnnotationsByPage);

    app.route('/api/annotation/ci/:ciId/page/:pageNum/create')
        .post(annotationCtrl.createAnnotation);

    app.route('/api/annotation/:anId')
        .put(annotationCtrl.updateAnnotation);

    app.route('/api/annotation/:anId')
        .delete(annotationCtrl.deleteAnnotation);

    app.route('/api/annotations/count/:ciId/:category')
        .get(annotationCtrl.findAnnotationsCountByCategory);
};
