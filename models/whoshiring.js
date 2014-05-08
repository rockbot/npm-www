// a weighted randomizer for showing who's hiring in the npm nav
module.exports = hiring

var deck = require('deck')
var whos_hiring = require('../static/whos_hiring.json')

function hiring (showAll, cb) {
  if (typeof showAll === 'function') {
    cb = showAll
    showAll = false
  }

  var weights = {}
  var numCompanies = 0
  for (var k in whos_hiring) {
    numCompanies++
    weights[k] = whos_hiring[k].show_weight
  }

  if (showAll) {
    var order = deck.shuffle(weights)
    var companies = order.map(function (c) { return whos_hiring[c]})
    return cb(null, companies)
  }

  var company = whos_hiring[deck.pick(weights)]
  company.numCompanies = numCompanies
  return cb(null, company)
}