var demand     = require('must')
    , Wredis   = require('./index')
    , commands = require('./commands')
    , sinon    = require('sinon')

var opts = {
    writer: { host: 'localhost', port: 6379 },
    reader: { host: 'localhost', port: 6379 },
}

describe('Wredis', function() {
    var client;

    beforeEach(function() {
        client = new Wredis(opts);
    })

    it('throws without an options object', function() {
        function shouldThrow() { return new Wredis(); }

        shouldThrow.must.throw(/You must pass an options object/);
    })

    it('has all read functions defined on it', function() {
        commands.read.forEach(function(c) {
            client.must.have.property(c)
            client[c].must.be.a.function()
        })
    })

    it('has all write functions defined on it', function() {
        commands.write.forEach(function(c) {
            client.must.have.property(c)
            client[c].must.be.a.function()
        })
    })

    it('does not define redis-server-specific functions', function() {
        client.must.not.have.property('sync')
    });

    it('calls write functions on the writer', function(done) {
        var spy = sinon.spy(client.writer, 'set');

        client.set('foo', 'bar', function(err, reply) {
            demand(err).not.exist()
            spy.calledOnce.must.be.true()
            spy.calledWith('foo', 'bar').must.be.true()
            done()
        })
    })

    it('calls read functions on the reader', function(done) {
        var spy = sinon.spy(client.reader, 'get');

        client.get('foo', function(err, reply) {
            demand(err).not.exist()
            spy.calledOnce.must.be.true()
            spy.calledWith('foo').must.be.true()
            reply.must.be.a.string()
            reply.must.equal('bar')
            done()
        })
    })

    after(function(done) {
        client.del('foo', function(err, reply) {
            client.quit(function(err) {
                done()
            })
        })
    })
})
