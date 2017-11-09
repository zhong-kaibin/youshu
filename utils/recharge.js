import util from './util'

const recharge = {
  fetchConfig: function(cb){
    util.get('/other/config.json', function (res) {
        cb(res.data)
    })
  }
}

module.exports = recharge