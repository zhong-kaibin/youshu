var unit = require('./util.js')

//获取用户余额
function getBalance(cb) {
  unit.get('/balance/get_balance', function (res) {
    cb(res.data.balance)
  })
}


//获取自动购买列表
function getAutoBuyList(cb) {
  unit.get('/buy/next/auto/list', function (res) {
    cb(res.data)
  })
}

module.exports = {
  getBalance: getBalance,
  getAutoBuyList: getAutoBuyList
}