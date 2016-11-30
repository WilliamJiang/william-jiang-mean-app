var tbcc = angular.module('app');

tbcc.directive('viewAllAnnotations', ["DataService", "NotifierService", function (DataService, NotifierService) {
    "use strict";

    return {
        templateUrl: "/partials/directives/annotation/view_all_annotations.html",
        restrict: "EA",
        replace: true,
        scope: true,
        link: function ($scope, element, attrs) {
        	
			var customFields = {
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
			
//			$scope.filterOptions = [{id:"stuck", name:"Stuck"},{id:"needsReview", name:"Needs Review"},{id:"markedAsApplied", name:"Applied"},{id:"notes", name:"Note"},{id:"clearstuck", name:"Cleared"}];
			$scope.filterOptions = [{id:"stuck", name:"Stuck"}, {id:"needsReview", name:"Needs Review"}];
			$scope.initSetupAnnotations = false;
 
			function resetFilterOptions(){
				$scope.selectedFilters = [];
				$scope.searchOptions = {};
				$scope.selectedConditionsLabel = "Conditions";
				$scope.initSetupAnnotations = true;
			}
			
        	$scope.$on("setupAnnotations", function(event, args) {
                $scope.ciAnnotations = [];
                $scope.ciAnnotationsCount = 0;
				$scope.disableRotation = $scope.ciAnnotationsCount > 0;
                $scope.ciAnnotationsPageItemsLength = 5000;
                $scope.getCIAnnotationsInProgress = false;

//                $scope.onClickViewAllAnnotations();
                if(!$scope.initSetupAnnotations){
                    resetFilterOptions();
                }
                getCIAnnotations();
        	});
        	
        	$scope.$on("annotationCreated", function(event, args) {
        		$scope.ciAnnotationsCount++;
				$scope.disableRotation = $scope.ciAnnotationsCount > 0;
				$scope.$parent.disableRotation = $scope.disableRotation;
        	});

        	$scope.$on("annotationDeleted", function(event, args) {
                $scope.ciAnnotationsCount = $scope.ciAnnotationsCount == 0 ? 0 : $scope.ciAnnotationsCount -1;
                $scope.disableRotation = $scope.ciAnnotationsCount > 0;
				$scope.$parent.disableRotation = $scope.disableRotation;
        	});
        	
            $scope.onClickViewAllAnnotations = function(){
            	resetFilterOptions();
            	getCIAnnotations();
            };
            
            $scope.onClose = function(){
            	// Reset All filters and update the count by making RESTful call onClose
            	$scope.onClickViewAllAnnotations();
            };
            
            $scope.onAnnotationClick = function(annotation){
            	$scope.loadCIOnAnnotationClick(annotation);
            };         
            
            $scope.setSelectedFilter = function(id){
                if (_.contains($scope.selectedFilters, id)) {
                    $scope.selectedFilters = _.without($scope.selectedFilters, id);
                } else {
                    $scope.selectedFilters.push(id);
                }
                console.log($scope.selectedFilters);
                if($scope.selectedFilters.length === 0){
                	$scope.selectedConditionsLabel = "Conditions";
                	
                }else if($scope.selectedFilters.length === 1){
                	$scope.filterOptions.forEach(function(filterObj){
                		if(filterObj.id === $scope.selectedFilters[0]){
                			$scope.selectedConditionsLabel = filterObj.name;
                		}                		
                	});
                	                	
                }else{
                	$scope.selectedConditionsLabel = "Conditions("+$scope.selectedFilters.length+")";
                }
                $scope.selectedConditionsLabel
                return false;

            };
            $scope.isChecked = function (id) {     
                if (_.contains($scope.selectedFilters, id)) {
                    return 'active';
                }
                return false;
            }; 
            
            $scope.filter = function (){
            	if(!$scope.selectedFilters){
            		$scope.selectedFilters = [];
            	}
            	$scope.searchOptions = {};
            	
            	$scope.selectedFilters.forEach(function(filterId){
            		if(filterId === "stuck"){
            			$scope.searchOptions.stuck = true;            			
            		}else if(filterId === "needsReview"){
            			$scope.searchOptions.needsReview = true;
            		}else if(filterId === "notes"){
            			$scope.searchOptions.notes = true;
            		}else if(filterId === "markedAsApplied"){
            			$scope.searchOptions.markedAsApplied = true;
            		}else if(filterId === "clearstuck"){
            			$scope.searchOptions.clearstuck = true;
            		}
            		
            	});
            	getCIAnnotations();
            }
            
            function applyCategoriesData(annotation){
            	var customData = null,
    				customDataLength = 0,
    				fieldData = null;
            	
            	if(!annotation){
            		return;
            	}
    			if (annotation.customData) {
    				customData = annotation.customData;
    				customDataLength = customData.length;
    			}
    			// Handle Stuck Annotations
    			if (annotation.category === "errata") {
    				var fldStuckReason = "";

    				for (var i = 0; i < customDataLength; i++) {
    					fieldData = customData[i];
    					if (fieldData && fieldData.key) {
    						if (fieldData.key === customFields.stuckReason) {
    							fldStuckReason = fieldData.value;
    						}
    					}
    				}
    				annotation.fldStuckReason = fldStuckReason;
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
    						if (fieldData.key === customFields.dealIDs) {
    							fldDealIDs = fieldData.value;
    						}
    						if (fieldData.key === customFields.markEndDatedUser) {
    							fldMarkEndDatedUser = fieldData.value;
    						}
    						if (fieldData.key === customFields.markEndDatedTime) {
    							fldMarkEndDatedTime = fieldData.value;
    						}
    						if (fieldData.key === customFields.markReviewedUser) {
    							fldMarkReviewedUser = fieldData.value;
    						}
    						if (fieldData.key === customFields.markReviewedTime) {
    							fldMarkReviewedTime = fieldData.value;
    						}
    						if (fieldData.key === customFields.markEndDateReviewedUser) {
    							fldMarkEndDateReviewedUser = fieldData.value;
    						}
    						if (fieldData.key === customFields.markEndDateReviewedTime) {
    							fldMarkEndDateReviewedTime = fieldData.value;
    						}
    					}
    				}
    				annotation.fldDealIDs = fldDealIDs;
    				if (fldMarkEndDatedUser && fldMarkEndDatedTime) {
    					annotation.fldMarkEndDatedUser = fldMarkEndDatedUser;
    					annotation.fldMarkEndDatedTime = fldMarkEndDatedTime;
    				}
    				if (fldMarkReviewedUser && fldMarkReviewedTime) {
    					annotation.fldMarkReviewedUser = fldMarkReviewedUser;
    					annotation.fldMarkReviewedTime = fldMarkReviewedTime;
    				}
    				if (fldMarkEndDateReviewedUser && fldMarkEndDateReviewedTime) {
    					annotation.fldMarkEndDateReviewedUser = fldMarkEndDateReviewedUser;
    					annotation.fldMarkEndDateReviewedTime = fldMarkEndDateReviewedTime;
    				}
    				// Handle Clear Stuck Annotations
    			} else if (annotation.category === "clearstuck") {
    				var fldStuckReason = "",
    					fldClearStuckUser = null,
    					fldClearStuckTime = null;

    				for (var i = 0; i < customDataLength; i++) {
    					fieldData = customData[i];
    					if (fieldData && fieldData.key) { //value
    						if (fieldData.key === customFields.markStuckClearedUser) {
    							fldClearStuckUser = fieldData.value;
    						}
    						if (fieldData.key === customFields.markStuckClearedTime) {
    							fldClearStuckTime = fieldData.value;
    						}
    						if (fieldData.key === customFields.stuckReason) {
    							fldStuckReason = fieldData.value;
    						}
    					}
    				}
    				annotation.fldStuckReason = fldStuckReason;
					annotation.fldClearStuckUser = fldClearStuckUser;
					annotation.fldClearStuckTime = fldClearStuckTime;    				   				
    			}
            }
            
            function getCIAnnotations() {
            var onSuccess = function (data) {
            		var annotationsArray = null,
            		    annotationsArrayLength = 0;  
            		
            		$scope.ciAnnotations = [];

            		if(data && data.annotations){
            			annotationsArray = data.annotations;
            			annotationsArrayLength = annotationsArray.length;
            			for (var ind = 0; ind <annotationsArrayLength; ind++){
            				var annotationObj = annotationsArray[ind];
            				applyCategoriesData(annotationObj);
            				$scope.ciAnnotations.push(annotationObj);
            			}
            		}
					if(data && data.count){
						$scope.ciAnnotationsCount = data.count;
						$scope.$parent.ciAnnotationsCount = data.count;
						$scope.$parent.disableRotation = $scope.$parent.ciAnnotationsCount > 0;
					}
					else {
						$scope.$parent.ciAnnotationsCount = 0;
						$scope.$parent.disableRotation = false;
					}

            		$scope.getCIAnnotationsInProgress = false;

					//PavaniKa: 05192015 - this is to add the scrolling and other behaviors to this panel!
					if (TPVTB.AddViewAllAnnotationsBehaviors && _.isFunction(TPVTB.AddViewAllAnnotationsBehaviors)) {
						//this is defined in main.js from Agility!
						TPVTB.AddViewAllAnnotationsBehaviors();
					}
            	},
            	onError = function () {
                    NotifierService.notifySuccess("Failed to get annotations for CI: " + $scope.ci._id);
                    $scope.getCIAnnotationsInProgress = false;
                }
            	
        		//if(!$scope.ciAnnotations){
//        			$scope.ciAnnotations = [];
        		//}
        		
    /*    		if($scope.ciAnnotationsCount !==0 && $scope.ciAnnotations.length >=$scope.ciAnnotationsCount){
        			return;
        		}*/
            	
            	if($scope.getCIAnnotationsInProgress){
            		return;
            	}
            	$scope.getCIAnnotationsInProgress = true;            	

            	$scope.searchOptions.ciID = $scope.ci._id;
            	$scope.searchOptions.skip = 0;
            	$scope.searchOptions.limit = $scope.ciAnnotationsPageItemsLength;
            	
                DataService.Annotations.getAllAnnotations($scope.searchOptions).then(onSuccess).catch(onError);
            }
        }
    }
}]);