var unit = require('../../utils/util.js')
//加载中
function setLoading() {
  unit.showLoading({
    title: '正在加载中~',
  })
  this.setData({
    loading: true
  })
}

function setComplete() {
  unit.hideLoading()
  this.setData({
    loading: false
  })
}

//navi充值页
function navigateTodRecharge() {
  var pageLen = getCurrentPages().length || 0
  var { book_id, index } = this.data
  var backurl = encodeURIComponent(`/pages/readerComic/reader?book_id=${book_id}&index=${index}`)
  wx.redirectTo({
    url: '/pages/recharge/recharge?backurl=' + backurl,
  })
}

module.exports = {
  setLoading: setLoading,
  setComplete: setComplete,
  navigateTodRecharge: navigateTodRecharge
}