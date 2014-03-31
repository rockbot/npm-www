var url = require('url')

module.exports = function (req, res) {
  // delete the session from couch.
  // also delete any other login bits.
  req.couch.logout(next)

  function next () {
    // delete the whole session
    req.session.get('done', function (er, done) {
      req.metrics.counter('users>logouts')
      var donePath = '/profile'
      if (done) {
        // Make sure that we don't ever leave this domain after login
        // resolve against a fqdn, and take the resulting pathname
        done = url.resolveObject('https://example.com/login', done.replace(/\\/g, '/'))
        donePath = done.pathname
      }

      req.session.del(function (er) {
        if (er) return res.error(er)
        res.redirect(donePath)
      })
    })
  }
}
