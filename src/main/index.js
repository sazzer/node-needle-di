var Q = require('q'),
    Base = require('selfish').Base,
    Container = require('./container'),
    Entry = require('./entry');

/**
 * The core class of the Needle Dependency Injection framework
 */
module.exports = Base.extend({
    /**
     * Construct a new container
     */
    initialize: function() {
        this._entries = {};
    },
    /**
     * Create a registration for a new entry. This simply creates the entry and further configuration on it is needed
     * for the object to be usable
     * @param name {String} The name of the new entry
     */
    register: function(name) {
        var entry = Entry.new();
        this._entries[name] = entry;
        return entry;
    },
    /**
     * Indicate that construction of the container is done and we should go ahead and build it now.
     * This will do some sanity checking of the configuration and make sure that everything is ok, and
     * either return an error or success when that is actually the case
     * @return {Q} A Promise of either the success or failure of building the container
     */
    done: function() {
        return Q.fcall(function() {
            this._validateDependencies();
            return this._entries;
        }.bind(this)).then(function(entries) {
            return Container.new(entries);
        }).then(function(container) {
            return Q.allSettled(Object.keys(this._entries).map(function(k) {
                var entry = this._entries[k];
                if (!entry.isLazy) {
                    return container.get(k);
                }
            }.bind(this)))
            .then(function() {
                return container;
            });
        }.bind(this));
    },
    /**
     * Validate all of the dependencies are met in the container
     */
    _validateDependencies: function() {
        Object.keys(this._entries).forEach(function(k) {
            var entry = this._entries[k];
            entry.dependencies.forEach(function(dep) {
                if (!this._entries[dep]) {
                    throw Error("Entry '" + k + "' is missing dependency '" + dep + "'");
                }
            }.bind(this));
        }.bind(this));
    }
});
