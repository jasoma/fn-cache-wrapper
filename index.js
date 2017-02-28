const cache = require('fn-cache');
const isFunction = require('lodash.isfunction');
const merge = require('lodash.merge');

function ownProps(object) {
    return Object.getOwnPropertyNames(object);
}

function proto(object) {
    return Object.getPrototypeOf(object);
}

/**
 * Get all property names of an object.
 */
function allProps(object) {
    return ownProps(object).concat(ownProps(proto(object)));
}

/**
 * Property names to always exclude when doing method searches.
 */
let excluded = ownProps(proto(Object)).concat(ownProps(proto({})));

/**
 * Finds all the user defined functions/methods on an object.
 *
 * @param {object} object - the object to pull methods from.
 * @returns {function[]} - an array containing the functions from the object.
 */
function methods(object) {
    return allProps(object)
        .filter(name => !excluded.includes(name))
        .filter(name => isFunction(object[name]))
        .map(name => {
            return { name, fn: object[name] };
        });
}

/**
 * Create the cached version of a function optionally binding it.
 *
 * @param {function} dn - the function to cache.
 * @param {number} lifetime - the cache lifetime of results.
 * @param {object} [self] - the object to bind the function to.
 */
function createCacheFn(fn, lifetime, self) {
    return (self)
        ? cache(lifetime)(fn.bind(self))
        : cache(lifetime)(fn);
}

/**
 * Wraps each function in an object with a cache using fn-cache and returns
 * a new object with the cache functions attached.
 *
 * @param {object} object - the object whose methods should be cached.
 * @param {object} options
 * @param {number} [options.lifetime=Infinity] - the cache lifetime of results.
 * @param {boolean} [options.bind=true] - whether or not to bind functions being cached.
 * @param {boolean} [options.deep=true] - if true functions will be bound to the create wrapper
                                          so they call other cached functions.
 * @param {string[]} [options.exclude=[]] - function names to exclude from caching.
 * @returns {object} - a new object containing the wrapped methods.
 */
function wrap(object, { lifetime = Infinity, bind = true, deep = true, props = true, exclude = [] } = {}) {
    let cached = props ? merge({}, object) : object;
    for (let method of methods(object)) {
        if (exclude.includes(method.name)) {
            cached[method.name] = method.fn;
            continue;
        }
        let self;
        if (bind) {
            self = deep ? cached : object;
        }
        cached[method.name] = createCacheFn(method.fn, lifetime, self);
    }
    return cached;
}

/**
 * Replaces each function in an object with a cached version using fn-cache.
 *
 * @param {object} object - the object whose methods should be cached.
 * @param {object} options
 * @param {number} [options.lifetime=Infinity] - the cache lifetime of results.
 * @param {boolean} [options.bind=true] - whether or not to bind functions being cached.
 * @param {string[]} [options.exclude=[]] - function names to exclude from caching.
 */
function replace(object, { lifetime = Infinity, bind = true, exclude = [] } = {}) {
    for (let method of methods(object)) {
        if (exclude.includes(method.name)) {
            continue;
        }
        object[method.name] = createCacheFn(method.fn, lifetime, (bind ? object : null));
    }
}

module.exports = { wrap, replace }
