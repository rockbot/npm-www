var assert = require('assert')
  , commands = require('./commands')
  , events = require('events')
  , redis = require('redis')
  , util = require('util')

var Wredis = module.exports = function Wredis(opts) {
  assert(opts && typeof opts === 'object', "You must pass an options object.")
  assert(opts.writer && opts.writer.port, "You must pass a `writer` options field with at least a port spec")
  assert(opts.reader && opts.reader.port, "You must pass a `reader` options field with at least a port spec")

  events.EventEmitter.call(this)

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
util.inherits(Wredis, events.EventEmitter)

Wredis.prototype.writer = null
Wredis.prototype.reader = null

Wredis.prototype.auth = function auth(pass, callback) {
  this.writer.auth(pass)
  this.reader.auth(pass, callback)
}

Wredis.prototype.select = function select(index, callback) {
  this.writer.select(index)
  this.reader.select(index, callback)
}

Wredis.prototype.quit = function quit(callback) {
  this.writer.quit()
  this.reader.quit(callback)
}

Wredis.prototype.end = function end() {
  this.writer.end()
  this.reader.end()
}
