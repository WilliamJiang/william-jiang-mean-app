module.exports = exports = function History (schema, plgOptions) {

	var historyObjects = {};
	plgOptions = plgOptions || {};
	
	function getHistoryCollection(connection){
		if(!historyObjects.collection){
			historyObjects.collection = connection.db.collection(plgOptions.collectionName || "historicals");
		}
		return historyObjects.collection;
	}
	
	function saveHistory(doc, action, next){
		var connection = plgOptions.connection,
			collectionName = doc.constructor && doc.constructor.collection && doc.constructor.collection.name,			
			doc = doc ||{},
			next = next || function(){},
			action = action || "",
			historyCollection = null;
		
		if(!connection || !connection.db){
			console.dir("Mongoose Connection or db not available!");
			return next();
		}
		if(!collectionName){
			console.dir("Mongoose Collection doesn't exist!");
			return next();
		}
		
		historyCollection = getHistoryCollection(connection);
		return historyCollection.insert({
			ts: new Date(),
			coll: collectionName,
			action: action,
			user: doc.updatedUser || doc.createdUser || doc.owner,
			userID: doc.updatedUserID || doc.updated_by_id || doc.createdUserID || doc.created_by,
			network: doc.network,
			doc: doc.toObject(),
		}, next);
		
	}
	
	schema.statics.saveHistory = function(doc, action, next) {
		saveHistory(doc, action, next);
	}
	
	schema.pre("save", function(next) {
		if(this.isModified()){
			var action = "";
			if(this.isNew){
				action = "created";
			}else{
				if(typeof this.recordStatus === "number" && this.recordStatus === 1){
					action = "deleted";
				}else{
					action = "updated";
				}
			}
			saveHistory(this, action, next);
		}else{
			next();
		}	    
	});
	
	schema.pre("remove", function(next) {
		saveHistory(this, "deleted", next);
	});
	
	schema.pre("update", function() {
	    var self = this;
	});

}