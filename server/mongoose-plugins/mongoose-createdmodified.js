(function() {
    
    var ObjectId, Schema, addSchemaField, createdModifiedPlugin, defaults, extend, mongoose;

    mongoose = require('mongoose');

    Schema = mongoose.Schema;

    ObjectId = Schema.ObjectId;

    extend = function(dst, src) {
        var key, val;
        for (key in src) {
            val = src[key];
            dst[key] = val;
        }
        return dst;
    };

    defaults = function(dst, src) {
        var key, val;
        for (key in src) {
            val = src[key];
            if (!(key in dst)) {
                dst[key] = val;
            }
        }
        return dst;
    };

    addSchemaField = function(schema, pathname, fieldSpec) {
        var fieldSchema;
        fieldSchema = {};
        fieldSchema[pathname] = fieldSpec;
        return schema.add(fieldSchema);
    };

    createdModifiedPlugin = function(schema, options) {
        var createdName, modifiedName;
        if (options == null) {
            options = {};
        }
        defaults(options, {
            createdName: 'created',
            modifiedName: 'modified',
            index: false
        });
        createdName = options.createdName;
        modifiedName = options.modifiedName;
        addSchemaField(schema, createdName, {
            type: Date,
            "default": function() {
                return null;
            }
        });
        addSchemaField(schema, modifiedName, {
            type: Date,
            "default": function() {
                return null;
            }
        });
        schema.pre("save", function(next) {
	    
            var _ref;
	    
            this[modifiedName] = new Date();
	    
            if ((_ref = this.get(createdName)) === (void 0) || _ref === null) {
                this[createdName] = new Date();
            }
            return next();
        });
        if (options.index) {
            schema.path(createdName).index(options.index);
        }
        if (options.index) {
            return schema.path(modifiedName).index(options.index);
        }
    };

    module.exports = {
        createdModifiedPlugin: createdModifiedPlugin
    };

}).call(this);
