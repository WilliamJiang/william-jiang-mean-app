module.exports = exports = function CustomQueryPlugin (schema, plgOptions) {

  var queryMethods = ["find", "findOne", "count", "findOneAndUpdate", "update", "findOneAndRemove"],
      nonQueryMethods = ["create", "save"];
  plgOptions = plgOptions || {};
  if(!plgOptions.hasOwnProperty("filter")){
	  plgOptions.filter = true;
  }
  
  queryMethods.forEach(function(method){
	  schema.statics[method+"Custom"] = function(options, cb) {
		  
		  var that = this, options = options || {},
		      user = options.user || {},
		      currentNetwork = user.affiliation && user.affiliation.metadata && user.affiliation.metadata.active_network ? user.affiliation.metadata.active_network: null,
		      query = options.query || {},
		      update = options.update,
		      qOptions = options.qOptions,
		      queryAndUpdateCallback = function(err, resultData){
				  if(!cb){
					  cb = function(){};
				  }
				  if(err || !resultData || typeof resultData === "number"){
					  return cb(err, resultData);
				  }
				  if(typeof that["saveHistory"] === "function"){
					  that["saveHistory"](resultData, "update");
				  }

				  return cb(err, resultData);
			  };
			  
		  if(!options.hasOwnProperty("filter")){
			  options.filter = true;
		  }
	  
		  if(plgOptions.filter && options.filter){
			  query.network= currentNetwork;		  
		  }
		  
		  if(update && qOptions){
			  return this[method](query, update, qOptions, queryAndUpdateCallback); 
			  
		  }else if(update){
			  return this[method](query, update, queryAndUpdateCallback); 
			  
		  }else if(qOptions){
			  return this[method](query, qOptions, cb); 
			  
		  }else{
			  return this[method](query, cb); 
		  }			  
	  };  
  });
  
  nonQueryMethods.forEach(function(method){
	  schema.statics[method+"Custom"] = function(options, cb) {
		  var options = options || {},
		      user = options.user || {},
		      currentNetwork = user.affiliation && user.affiliation.metadata && user.affiliation.metadata.active_network ? user.affiliation.metadata.active_network: null,
		      doc = options.doc || {};	  
	  
		  if(!plgOptions.filter || (doc.network && doc.network === currentNetwork)){
			  return this[method](doc, cb); 
		  }else{
			  return cb(new Error("Access denied for Network"));
		  }		  
	  };  
  });

}