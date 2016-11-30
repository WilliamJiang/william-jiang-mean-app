angular.module('tbadmin').value('mvToaster',toastr);

angular.module('tbadmin').factory('NotifierService',function(mvToaster) {

    //additional options for toastr
    mvToaster.options = {
        "closeButton": true,
        "showDuration": "300",
        "hideDuration": "300",
        "timeOut": "2000",
        "extendedTimeOut": "1000"
    };

    return {
        notifySuccess: function(msg) {
            mvToaster.success(msg);
        },
        notifyError: function(msg){
            mvToaster.error(msg);
        },
        notifyWarning: function(msg){
            mvToaster.warning(msg);
        }
    }
});
