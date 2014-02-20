var redis = require('redis')
  , assert = require('assert')
  , commands = require('./commands')

var Wredis = module.exports = function Wredis(opts) {
  assert(opts && typeof opts === 'object', "You must pass an options object.")
  assert(opts.writer && opts.writer.port, "You must pass a `writer` options field with at least a port spec")
  assert(opts.reader && opts.reader.port, "You must pass a `reader` options field with at least a port spec")

  this.writer = redis.createClient(opts.writer.port, opts.writer.host, opts)
  this.reader = redis.createClient(opts.reader.port, opts.reader.host, opts)

  var self = this
  commands.read.forEach(function(c) {
  self[c] = function() { return self.reader[c].apply(self.reader, arguments); }
  })

  commands.write.forEach(function(c) {
  self[c] = function() { return self.writer[c].apply(self.writer, arguments); }
  })
}

Wredis.prototype.writer = null
Wredis.prototype.reader = null

Wredis.prototype.auth = function auth(pass, callback) {
  var self = this
  if (!callback) callback = function() {}

  self.writer.auth(pass, function(err, reply) {
    if (err) return callback(err)
    self.reader.auth(pass, function(err, reply) {
      callback(err, reply)
    })
  })
}

Wredis.prototype.select = function select(index, callback) {
  var self = this
  if (!callback) callback = function() {}

  self.writer.select(index, function(err, reply) {
    if (err) return callback(err)
    self.reader.select(index, function(err, reply) {
      callback(err, reply)
    })
  })
}

Wredis.prototype.quit = function quit(callback) {
  var self = this
  if (!callback) callback = function() {}

  self.writer.quit(function(err, reply) {
    if (err) return callback(err)
    self.reader.quit(function(err, reply) {
      callback(err, reply)
    })
  })
}
