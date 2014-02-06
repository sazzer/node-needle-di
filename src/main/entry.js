var Base = require('selfish').Base;
    

/**
 * The representation of an entry in the DI container
 */
module.exports = Base.extend({
    /**
     * Construct the new Entry
     */
    initialize: function() {
        this.dependencies = [];
        this.isPrototype = false;
        this.isLazy = true;
        this.factory = function() { return arguments[arguments.length - 1]; };
        this.requiredModules = [];
    },
    /**
     * Define this entry as a Prototype Entry - i.e. one that causes a new instance to be created every time
     * @return this, for chaining
     */
    prototype: function() {
        this.isPrototype = true;
        return this;
    },
    /**
     * Define this entry as a Singleton Entry - i.e. one that causes the same instance to be retuned every time
     * @return this, for chaining
     */
    singleton: function() {
        this.isPrototype = false;
        return this;
    },
    /**
     * Define this entry as a Lazy Entry - i.e. one that won't be created until it is needed
     * @return this, for chaining
     */
    lazy: function() {
        this.isLazy = true;
        return this;
    },
    /**
     * Define this entry as a Eager Entry - i.e. one that will be created immediately
     * @return this, for chaining
     */
    eager: function() {
        this.isLazy = false;
        return this;
    },
    /**
     * Add a new dependency to the entry
     * @param name {String} the name of the dependency
     * @return this, for chaining
     */
    dependsOn: function(name) {
        this.dependencies.push(name);
        return this;
    },
    /**
     * Set the entry to build a static value
     * @param value {Any} the static value to return
     * @return this, for chaining
     */
    staticValue: function(value) {
        this.factory = function() {
            return value;
        };
        return this;
    },
    /**
     * Set the entry to build a value by calling a factory function
     * @param f {Function} The function to call to build the value. This function will be passed
     *     an Object containing all of the dependencies keyed off of the dependency names
     * @return this, for chaining
     */
    factoryFunction: function(f) {
        this.factory = f;
        return this;
    },
    /**
     * Add a module that is required for this dependency to load. All of the required modules
     * are passed in as additional arguments before object containing dependencies
     * when the factory function is called
     * @param r {String} The path to the module to load
     * @return this, for chaining
     */
    requires: function(r) {
        this.requiredModules.push(r);
        return this;
    }
});

