var users = require('./all_users.json').rows
var fs = require('fs')

var docs = []

for (var i = 0; i < users.length; i++) {
	var info = users[i].doc
	if (info.email) {
    info.email = info.name + '@example.com'
    info.salt = "cookie"
  	info.password_sha = "nomnomcake"
	}
  delete info._rev

  docs.push(info)
	console.log(i)
}

fs.writeFile('sample_users.json', JSON.stringify({docs: docs}), function (err) {
  if (err) throw err;
  console.log('It\'s saved!');
});
