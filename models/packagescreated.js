// the count of created packages, corrected for packages that have been unpublished

var lastUpdated
var minUpdate = 10000 // update at most every 10 seconds
var fetching = false

module.exports = root
var callbacks = []
var cached = null

var npm = require('npm')
function root (cb_) {
  if (cached && Date.now() - lastUpdated < minUpdate) {
    return process.nextTick(cb_.bind(null, null, cached))
  }

  callbacks.push(cb_)
  if (fetching) return
  fetching = true

  function cb (er, data) {
    var c = callbacks.slice()
    callbacks.length = 0
    c.forEach(function (cb) {
      cb(er, data)
    })
  }

  npm.registry.get('/-/_view/fieldsInUse?group_level=1&startkey="name"&endkey="name"&stale=update_after', function (er, data, res) {
    fetching = false
    if (er) return cb(er)

    var packageCount = 0
    if (data.rows && data.rows.length > 0 && data.rows[0].value) {
      packageCount = data.rows[0].value
    }

    cached = packageCount
    lastUpdated = Date.now()
    cb(null, packageCount)
  })
}
