var Wredis = require('./index');
var assert = require('assert');

var wr = new Wredis(
{
    writer: { host: 'localhost', port: 6379 },
    reader: { host: 'localhost', port: 6379 },
});

// console.log(Object.keys(wr));

wr.set('foo', 'bar', function(err, r1)
{
    wr.keys('*', function(err, r2)
    {
        assert(Array.isArray(r2));

        wr.get('foo', function(err, r3)
        {
            assert(r3 == 'bar');
            wr.del('foo', function(err, r4)
            {
                process.exit(0);
            });
        })
    });
});
