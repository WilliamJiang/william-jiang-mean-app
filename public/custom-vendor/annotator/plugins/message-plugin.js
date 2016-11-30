//PLUGIN# 1
Annotator.Plugin.MessagePlugin = function (element, message) {
    var plugin = {};

    plugin.pluginInit = function () {
        this.annotator.viewer.addField({
            load: function (field, annotation) {
                field.innerHTML = message;
            }
        })
    };

    return plugin;
}

//PLUGIN# 2
// This is now a constructor and needs to be called with `new`.
Annotator.Plugin.MyPlugin = function (element, options) {

    // Call the Annotator.Plugin constructor this sets up the .element and
    // .options properties.
    Annotator.Plugin.apply(this, arguments);

    // Set up the rest of your plugin.
};

// Set the plugin prototype. This gives us all of the Annotator.Plugin methods.
Annotator.Plugin.MyPlugin.prototype = new Annotator.Plugin();

// Now add your own custom methods.
Annotator.Plugin.MyPlugin.prototype.pluginInit = function () {
    var scope = this;
    var _element = scope.element;
    var _options = scope.options;

    scope.annotator.viewer.addField({
        load: function (field, annotation) {
            var viewer = scope.annotator.viewer;
            field.innerHTML = _options.message;
        }
    })
};