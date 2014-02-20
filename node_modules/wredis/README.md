# wredis

A simple wrapper for two redis clients. It directs write commands to one client & read commands to the other. It does *not* support any meta commands that act upon the redis server; it only wraps data read & write operations. See [commands.js](https://github.com/npm/wredis/blob/master/commands.js) for the full list. Other functions supported: `auth()`, `select()`, `quit()`, and `end()`.

## Usage

```javascript
var Wredis = require('wredis');

var wr = new Wredis({
    writer: { host: 'localhost', port: 6379 },
    reader: { host: 'localhost', port: 6389 },
});

// this is called on the writer client
wr.set('foo', 'bar', function(err, r1) {
    // this is called on the reader client
    wr.keys('*', function(err, r2) {
        // reader
        wr.get('foo', function(err, r3) {
            // writer
            wr.del('foo', function(err, r4) {
                process.exit(0);
            });
        })
    });
});
```

The writer Redis client is available at `wr.writer` and the reader Redis client at `wr.reader`. These objects are ordinary [node_redis](https://github.com/mranney/node_redis) clients.

## License

ISC
