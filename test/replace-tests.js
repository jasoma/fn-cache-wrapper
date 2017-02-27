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
        replace(target, Infinity);
        let r = target.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, target.echo([1, 2, 3]));
        target.echo.clearCache();
        assert.notEqual(r, target.echo([1, 2, 3]));
    });

    it('should create caches for functions attached to an objects prototype', () => {
        let target = new TestPrototype();
        replace(target, Infinity);
        let r = target.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, target.echo([1, 2, 3]));
        target.echo.clearCache();
        assert.notEqual(r, target.echo([1, 2, 3]));
    });

    it('should create caches for class methods', () => {
        let target = new TestClass();
        replace(target, Infinity);
        let r = target.echo([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
        assert.equal(r, target.echo([1, 2, 3]));
        target.echo.clearCache();
        assert.notEqual(r, target.echo([1, 2, 3]));
    });

    it('should not interfere with class cross calls', () => {
        let target = new TestClass();
        replace(target, Infinity);
        let r = target.callsEcho([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
    });

    it('should not interfere with prototype cross calls', () => {
        let target = new TestPrototype();
        replace(target, Infinity);
        let r = target.callsEcho([1, 2, 3]);
        assert.deepEqual({input: [1,2,3]}, r);
    });

    it('should not bind', () => {
        let target = new TestPrototype();
        replace(target, Infinity, false);
        assert.throws(() => target.callsEcho([1, 2, 3]));
    })

});
