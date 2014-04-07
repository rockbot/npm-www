var request = require('request')
, querystring = require('querystring')
, config = require('../config.js')
, package = require('./package.js')

module.exports = search

function search(params, cb) {

  if (!params.q) {
    return cb(null, { hits: { total : 0 }})
  }

  var page = parseInt(params.page || '0', 10);

  var qs =
    { from : page*config.elasticsearch.pageSize
    , size : config.elasticsearch.pageSize
    , pretty: false
    }

  var url = config.elasticsearch.url + '/package/_search?' + querystring.stringify(qs)

  var payload = {
  "fields": [ "name", "keywords", "description", "author", "version", "stars", "dlScore", "dlDay", "dlWeek" ],
  "query": {
    "dis_max": {
      "tie_breaker": 0.7,
      "boost": 1.2,
      "queries": [
        {
          "function_score": {
            "query": {
              "match": {
                "name.untouched": params.q
              }
            },
            "boost_factor": 100
          }
        },
        {
          "bool": {
            "should": [
              {"match_phrase": {"name": params.q} },
              {"match_phrase": {"keywords": params.q} },
              {"match_phrase": {"description": params.q} },
              {"match_phrase": {"readme": params.q} }
            ],
            "minimum_should_match": 1,
            "boost": 50
          }
        },
        {
          "function_score": {
            "query": {
              "multi_match": {
                "query": params.q,
                "fields": ["name^4", "keywords", "description", "readme"]
              }
            },
            "functions": [
              {
                "script_score": {
                  "script": "(doc['dlScore'].isEmpty() ? 0 : doc['dlScore'].value)"
                }
              },
              {
                "script_score": {
                  "script": "doc['stars'].isEmpty() ? 0 : doc['stars'].value"
                }
              }
            ],
            "score_mode": "sum",
            "boost_mode": "multiply"
          }
        }
      ]
    }
  }
}

  request.get({
    url : url,
    json: payload
  }, function(e, r, o) {
    if (r && r.error)
      e = new Error(r.error)

    if (e)
      return cb(e)

    o.q = params.q
    o.page = page
    o.pageSize = config.elasticsearch.pageSize

    if (o && o.error) {
      var er = new Error('Search Error: ' + o.error)
      er.code = o.status || 500
      return cb(er, o)
    }

    if (r.statusCode !== 200 || !o) {
      var er = new Error('Search failed:' + JSON.stringify(o, null, 2))
      er.code = r.statusCode
      if (er.code === 200)
        er.code = 500
      return cb(er, o)
    }

    cb(null, o)
  });
}
