function DataService(
                     Restangular,
                     APP_CONFIG) {

    ////////////////////////////////////////

    var Annotations = {
    		
        getAnnotations: function(ci_id, pageNum) {
            return Restangular
            .all('annotation/ci/' + ci_id + '/page/'+pageNum)
            .getList();
        },
        createAnnotation: function(ci_id, pageNum, annotation) {
        	return Restangular
        	    .all("annotation")
        	    .one("ci", ci_id)
        	    .one("page", pageNum)
        	    .all("create")
        	    .post(annotation);
        },
        removeAnnotation: function(anId, annotation) {
            return Restangular
                .one('annotation',anId)
                .customDELETE();
        },
        updateAnnotation: function(anId, annotation) {
            return Restangular
                .one('annotation',anId)
                .customPUT(annotation);
        },
        getAnnotationsCountByCategory: function(ci_id, category) {
            return Restangular
                .one('annotations/count/'+ci_id+'/'+category)
                .get();
        }
    };
    return {
        Annotations:Annotations
    };
}

angular
    .module('app')
    .factory('DataService',[
        'Restangular',
        'APP_CONFIG',
        DataService
    ]);
