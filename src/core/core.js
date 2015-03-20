/**
 * Rangy, a cross-browser JavaScript range and selection library
 * https://github.com/timdown/rangy
 *
 * Copyright %%build:year%%, Tim Down
 * Licensed under the MIT license.
 * Version: %%build:version%%
 * Build date: %%build:date%%
 */

(function(factory, root) {
    if (typeof define == "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof module != "undefined" && typeof exports == "object") {
        // Node/CommonJS style
        module.exports = factory();
    } else {
        // No AMD or CommonJS support so we place Rangy in (probably) the global variable
        root.rangy = factory();
    }
})(function() {
    var OBJECT = "object", FUNCTION = "function", UNDEFINED = "undefined";

    /*----------------------------------------------------------------------------------------------------------------*/

    // Trio of functions taken from Peter Michaux's article:
    // http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
    function isHostMethod(o, p) {
        var t = typeof o[p];
        return t == FUNCTION || (!!(t == OBJECT && o[p])) || t == "unknown";
    }

    function isHostObject(o, p) {
        return !!(typeof o[p] == OBJECT && o[p]);
    }

    function isHostProperty(o, p) {
        return typeof o[p] != UNDEFINED;
    }

    function getBody(doc) {
        return isHostObject(doc, "body") ? doc.body : doc.getElementsByTagName("body")[0];
    }

    var forEach =
        function(arr, func) {
            arr.forEach(func);
        };

    var modules = {};

    var util = {
        isHostMethod: isHostMethod,
        isHostObject: isHostObject,
        isHostProperty: isHostProperty,
        getBody: getBody,
        forEach: forEach
    };

    var api = {
        version: "%%build:version%%",
        initialized: false,
        supported: true,
        util: util,
        modules: modules,
        config: {
            autoInitialize: (typeof rangyAutoInitialize == UNDEFINED) ? true : rangyAutoInitialize
        }
    };

    // Add utility extend() method
    var extend;
        util.extend = extend = function(obj, props, deep) {
            var o, p;
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    o = obj[i];
                    p = props[i];
                    if (deep && o !== null && typeof o == "object" && p !== null && typeof p == "object") {
                        extend(o, p, true);
                    }
                    obj[i] = p;
                }
            }
            return obj;
        };

        util.createOptions = function(optionsParam, defaults) {
            var options = {};
            extend(options, defaults);
            if (optionsParam) {
                extend(options, optionsParam);
            }
            return options;
        };

    (function() {
        var toArray;

            var slice = [].slice;
                    toArray = function(arrayLike) {
                        return slice.call(arrayLike, 0);
                    };

        util.toArray = toArray;
    })();

    // Very simple event handler wrapper function that doesn't attempt to solve issues such as "this" handling or
    // normalization of event properties
    var addListener;
            addListener = function(obj, eventType, listener) {
                obj.addEventListener(eventType, listener, false);
            };

        util.addListener = addListener;

    // Initialization
    function init() {
        if (api.initialized) {
            return;
        }

        api.initialized = true;

        // Initialize modules
        var module, errorMessage;
        for (var moduleName in modules) {
            if ( (module = modules[moduleName]) instanceof Module ) {
                module.init(module, api);
            }
        }
    }

    // Allow external scripts to initialize this library in case it's loaded after the document has loaded
    api.init = init;

    function Module(name, dependencies, initializer) {
        this.name = name;
        this.dependencies = dependencies;
        this.initialized = false;
        this.supported = false;
        this.initializer = initializer;
    }

    Module.prototype = {
        init: function() {
            var requiredModuleNames = this.dependencies || [];
            for (var i = 0, len = requiredModuleNames.length, requiredModule, moduleName; i < len; ++i) {
                moduleName = requiredModuleNames[i];

                requiredModule = modules[moduleName];

                requiredModule.init();
            }

            // Now run initializer
            this.initializer(this);
        },
    };

    function createModule(name, dependencies, initFunc) {
        var newModule = new Module(name, dependencies, function(module) {
            if (!module.initialized) {
                module.initialized = true;
                    initFunc(api, module);
                    module.supported = true;
            }
        });
        modules[name] = newModule;
        return newModule;
    }

    api.createModule = function(name) {
        var initFunc, dependencies;
            initFunc = arguments[2];
            dependencies = arguments[1];

        var module = createModule(name, dependencies, initFunc);

        // Initialize the module immediately if the core is already initialized
        if (api.initialized && api.supported) {
            module.init();
        }
    };

    api.createCoreModule = function(name, dependencies, initFunc) {
        createModule(name, dependencies, initFunc);
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    // Ensure rangy.rangePrototype and rangy.selectionPrototype are available immediately

    function RangePrototype() {}
    api.RangePrototype = RangePrototype;
    api.rangePrototype = new RangePrototype();

    function SelectionPrototype() {}
    api.selectionPrototype = new SelectionPrototype();

    /*----------------------------------------------------------------------------------------------------------------*/

    /* build:includeCoreModule(dom.js) */

    /*----------------------------------------------------------------------------------------------------------------*/

    /* build:includeCoreModule(domrange.js) */

    /*----------------------------------------------------------------------------------------------------------------*/

    /* build:includeCoreModule(wrappedrange.js) */

    /*----------------------------------------------------------------------------------------------------------------*/

    /* build:includeCoreModule(wrappedselection.js) */

    /*----------------------------------------------------------------------------------------------------------------*/

    // Wait for document to load before initializing
    var docReady = false;

    var loadHandler = function(e) {
        if (!docReady) {
            docReady = true;
            if (!api.initialized && api.config.autoInitialize) {
                init();
            }
        }
    };

        // Test whether the document has already been loaded and initialize immediately if so
        if (document.readyState == "complete") {
            loadHandler();
        } else {
            if (isHostMethod(document, "addEventListener")) {
                document.addEventListener("DOMContentLoaded", loadHandler, false);
            }

            // Add a fallback in case the DOMContentLoaded event isn't supported
            addListener(window, "load", loadHandler);
        }

    return api;
}, this);