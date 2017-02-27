const assert = require('assert');
const { wrap } = require('..');

let functionProperties = {
    echo(input) {
        return { input };
    }
}

function TestPrototype() {}
TestPrototype.prototype.echo = function(input) {
    return { input };
}
TestPrototype.prototype.callsEcho = function(input) {
    return this.echo(input);
}

class TestClass {
    echo(input) {
        return { input };
    }
    callsEcho(input) {
        return this.echo(input);
    }
}

describe('#wrap', () => {

    it('should create caches for function properties on an object', () => {
        let wrapped = wrap(functionProperties, Infinity);
        let r = wrapped.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, wrapped.echo([1, 2, 3]));
        wrapped.echo.clearCache();
        assert.notEqual(r, wrapped.echo([1, 2, 3]));
    });

    it('should create caches for functions attached to an objects prototype', () => {
        let wrapped = wrap(new TestPrototype(), Infinity);
        let r = wrapped.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, wrapped.echo([1, 2, 3]));
        wrapped.echo.clearCache();
        assert.notEqual(r, wrapped.echo([1, 2, 3]));
    });

    it('should create caches for class methods', () => {
        let wrapped = wrap(new TestClass(), Infinity);
        let r = wrapped.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, wrapped.echo([1, 2, 3]));
        wrapped.echo.clearCache();
        assert.notEqual(r, wrapped.echo([1, 2, 3]));
    });

    it('should not interfere with class cross calls', () => {
        let wrapped = wrap(new TestClass(), Infinity);
        let r = wrapped.callsEcho([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
    });

    it('should not interfere with prototype cross calls', () => {
        let wrapped = wrap(new TestPrototype(), Infinity);
        let r = wrapped.callsEcho([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
    });

    it('should deep wrap', () => {
        let wrapped = wrap(new TestClass(), Infinity);
        let r = wrapped.echo([1, 2, 3]);
        assert.equal(r, wrapped.callsEcho([1, 2, 3]));
    });

    it('should not deep wrap', () => {
        let wrapped = wrap(new TestClass(), Infinity, true, false);
        let r = wrapped.echo([1, 2, 3]);
        assert.notEqual(r, wrapped.callsEcho([1, 2, 3]));
    });

    it('should not bind', () => {
        let wrapped = wrap(new TestClass(), Infinity, false);
        assert.throws(() => wrapped.callsEcho([1, 2, 3]));
    })

});
