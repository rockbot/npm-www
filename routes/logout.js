var url = require('url')

module.exports = function (req, res) {
  // delete the session from couch.
  // also delete any other login bits.
  req.couch.logout(next)

  function next () {
    // delete the whole session
    req.session.get('done', function (er, done) {
      var donePath = done ? url.parse(done) : null

      req.session.del(function (er) {
        if (er) return res.error(er)
        res.redirect(donePath ? donePath.pathname : '/')
      })
    })
  }
}
