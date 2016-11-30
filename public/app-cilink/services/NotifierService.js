angular
    .module('app').factory('NotifierService',function() {
	var mvToaster = {
		success: function(msg){
			console.log(msg);
		},
		error: function(msg){
			console.log(msg);
		}
	};
   return {
       notifySuccess: function(msg) {
           mvToaster.success(msg);
       },
       notifyError: function(msg){
           mvToaster.error(msg);
       }
   }
});
