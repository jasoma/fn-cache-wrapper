const assert = require('assert');
const { replace } = require('..');

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

describe('#replace', () => {

    it('should create caches for function properties on an object', () => {
        let target = {
            echo(input) {
                return { input };
            }
        }
        replace(target);
        let r = target.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, target.echo([1, 2, 3]));
        target.echo.clearCache();
        assert.notEqual(r, target.echo([1, 2, 3]));
    });

    it('should create caches for functions attached to an objects prototype', () => {
        let target = new TestPrototype();
        replace(target);
        let r = target.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, target.echo([1, 2, 3]));
        target.echo.clearCache();
        assert.notEqual(r, target.echo([1, 2, 3]));
    });

    it('should create caches for class methods', () => {
        let target = new TestClass();
        replace(target);
        let r = target.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, target.echo([1, 2, 3]));
        target.echo.clearCache();
        assert.notEqual(r, target.echo([1, 2, 3]));
    });

    it('should respect the cache lifetime', done => {
        let target = new TestClass();
        replace(target, {lifetime: 100});
        let r = target.echo([1, 2, 3]);
        setTimeout(() => {
            let r2 = target.echo([1, 2, 3]);
            if (r == r2) {
                done(new Error('cache was not cleared'));
            }
            else {
                done();
            }
        }, 110);
    });

    it('should not interfere with class cross calls', () => {
        let target = new TestClass();
        replace(target);
        let r = target.callsEcho([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
    });

    it('should not interfere with prototype cross calls', () => {
        let target = new TestPrototype();
        replace(target);
        let r = target.callsEcho([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
    });

    it('should not bind', () => {
        let target = new TestPrototype();
        replace(target, {bind: false});
        assert.throws(() => target.callsEcho([1, 2, 3]));
    });

    it('should exclude functions', () => {
        let target = new TestClass();
        replace(target, {exclude: ['echo']});
        assert.notEqual(target.echo([1, 2, 3]), target.echo([1, 2, 3]));
        assert.ok(target.callsEcho([1, 2, 3]));
    });

    it('can still cross call after exclude', () => {
        let target = new TestClass();
        replace(target, {exclude: ['callsEcho']});
        assert.equal(target.callsEcho([1, 2, 3]), target.callsEcho([1, 2, 3]));
    });

});
