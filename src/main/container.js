var Q = require('q'),
    Base = require('selfish').Base;

/**
 * The actual implementation of the container after it's been built
 */
module.exports = Base.extend({
    /**
     * Construct a new container
     * @param entries {Object} The entry definitions to use
     */
    initialize: function(entries) {
        this._entries = entries;
        this._cache = {};
    },
    /**
     * Get the object with the given name
     * @param name {String} the name of the object to get
     */
    get: function(name) {
        var result;
        if (this._cache[name]) {
            // If it's in the cache then get it from the cache
            result = Q.when(this._cache[name]);
        } else {
            // If it's not in the cache, then build it anew
            result = Q.fcall(function() {
                var entry = this._entries[name],
                    value = undefined;

                if (entry) {
                    var deps = entry.dependencies || [];

                    var cfg = Q.all(deps.map(function(dep) {
                        var value = this.get(dep);
                        return value.then(function(v) {
                            return {
                                name: dep,
                                value: v
                            };
                        });
                    }.bind(this)));

                    value = cfg.then(function(deps) {
                        var cfg = {};

                        deps.forEach(function(d) {
                            cfg[d.name] = d.value;
                        });
                        return cfg;
                    }).then(function(cfg) {
                        var params = entry.requiredModules.map(function(m) {
                            return require(m);
                        }) || [];
                        params.push(cfg);
                        return params;
                    }).then(function(cfg) {
                        var result = undefined;
                        if (entry.factory) {
                            result = entry.factory.apply(entry, cfg);
                        }
                        return result;
                    });
                }
                return value;
            }.bind(this))
            .then(function(e) {
                if (e) {
                    var entry = this._entries[name];
                    if (!entry.isPrototype) {
                        this._cache[name] = e;
                    } else {
                        delete this._cache[name];
                    }
                } else {
                    console.log("Nothing built for '" + name + "', so not caching it");
                    delete this._cache[name];
                }
                return e;
            }.bind(this));
            this._cache[name] = result;
        }
        return result;
    }
});
