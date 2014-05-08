module.exports = whoshiring

var td = {}

td.title = "Who's Hiring?"

function whoshiring (req, res) {
  req.model.load("profile", req)
  req.model.load("whoshiring")
  req.model.loadAs("whoshiring", "whoshiringall", true)
  req.model.end(function(er, m) {
    if(er) return res.error(er)
    td.profile = m.profile
    td.companies = m.whoshiringall
    td.hiring = m.whoshiring
    res.template('whoshiring.ejs', td)
  })
}