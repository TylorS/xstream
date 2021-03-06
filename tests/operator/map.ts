import xs from '../../src/index';
import * as assert from 'assert';

describe('Stream.prototype.map', () => {
  it('should transform values from input stream to output stream', (done) => {
    const stream = xs.periodic(100).map(i => 10 * i).take(3);
    const expected = [0, 10, 20];

    stream.addListener({
      next: (x: number) => {
        assert.equal(x, expected.shift());
      },
      error: (err: any) => done(err),
      complete: () => {
        assert.equal(expected.length, 0);
        done();
      },
    });
  });

  it('should propagate user mistakes in project as errors', (done) => {
    const source = xs.periodic(30).take(1);
    const stream = source.map(
      x => (<string> <any> x).toLowerCase()
    );

    stream.addListener({
      next: () => done('next should not be called'),
      error: (err) => {
        assert.notStrictEqual(err.message.match(/is not a function$/), null);
        done();
      },
      complete: () => {
        done('complete should not be called');
      },
    });
  });

  it('should clean up Operator producer when complete', (done) => {
    const stream = xs.of(1, 2, 3).map(i => i * 10);
    const expected = [10, 20, 30];
    let completeCalled = false;

    stream.addListener({
      next: (x: number) => {
        assert.strictEqual(x, expected.shift());
        assert.strictEqual(stream['_prod']['out'], stream);
      },
      error: (err: any) => done(err),
      complete: () => {
        completeCalled = true;
      },
    });

    assert.strictEqual(completeCalled, true);
    assert.strictEqual(stream['_prod']['out'], null);
    done();
  });

  it('should clean up Operator producer when failed', (done) => {
    const stream = xs.of<any>('a', 'b', 3).map(i => i.toUpperCase());
    const expected = ['A', 'B'];
    let errorCalled = false;

    stream.addListener({
      next: (x: number) => {
        assert.strictEqual(x, expected.shift());
        assert.strictEqual(stream['_prod']['out'], stream);
      },
      error: (err: any) => {
        errorCalled = true;
      },
      complete: () => {
        done('complete should not be called');
      },
    });

    assert.strictEqual(errorCalled, true);
    assert.strictEqual(expected.length, 0);
    assert.strictEqual(stream['_prod']['out'], null);
    done();
  });
});
