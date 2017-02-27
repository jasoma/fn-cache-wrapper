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
        let wrapped = wrap(functionProperties);
        let r = wrapped.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, wrapped.echo([1, 2, 3]));
        wrapped.echo.clearCache();
        assert.notEqual(r, wrapped.echo([1, 2, 3]));
    });

    it('should create caches for functions attached to an objects prototype', () => {
        let wrapped = wrap(new TestPrototype());
        let r = wrapped.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, wrapped.echo([1, 2, 3]));
        wrapped.echo.clearCache();
        assert.notEqual(r, wrapped.echo([1, 2, 3]));
    });

    it('should create caches for class methods', () => {
        let wrapped = wrap(new TestClass());
        let r = wrapped.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, wrapped.echo([1, 2, 3]));
        wrapped.echo.clearCache();
        assert.notEqual(r, wrapped.echo([1, 2, 3]));
    });

    it('should respect the cache lifetime', done => {
        let wrapped = wrap(new TestClass(), {lifetime: 100});
        let r = wrapped.echo([1, 2, 3]);
        setTimeout(() => {
            let r2 = wrapped.echo([1, 2, 3]);
            if (r == r2) {
                done(new Error('cache was not cleared'));
            }
            else {
                done();
            }
        }, 110);
    });

    it('should not interfere with class cross calls', () => {
        let wrapped = wrap(new TestClass());
        let r = wrapped.callsEcho([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
    });

    it('should not interfere with prototype cross calls', () => {
        let wrapped = wrap(new TestPrototype());
        let r = wrapped.callsEcho([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
    });

    it('should deep wrap', () => {
        let wrapped = wrap(new TestClass());
        let r = wrapped.echo([1, 2, 3]);
        assert.equal(r, wrapped.callsEcho([1, 2, 3]));
    });

    it('should not deep wrap', () => {
        let wrapped = wrap(new TestClass(), {deep: false});
        let r = wrapped.echo([1, 2, 3]);
        assert.notEqual(r, wrapped.callsEcho([1, 2, 3]));
    });

    it('should not bind', () => {
        let wrapped = wrap(new TestClass(), {bind: false});
        assert.throws(() => wrapped.callsEcho([1, 2, 3]));
    })

});
