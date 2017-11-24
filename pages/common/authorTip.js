module.exports = {
  _bindgetuserinfo:function(){
    this.onLoad(getApp().query)
    this.setData({
      authorTip: {
        show: false
      }
    })
  },
  _naviToHome:function(){
    wx.switchTab({
      url: '/pages/recommend/recommend',
    })
  },
  _showAuthorTip(){
    var pages = getCurrentPages()
    var path = pages[pages.length - 1].route
    var tip = "浏览当前界面需登录，点击确定授权登录，取消将返回首页"
    if (path == "pages/reader/reader" || path == "pages/readerComic/reader"){
      tip = "阅读当前文章需授权登录，点击确定授权登录，取消将返回首页"
    }
    this.setData({
      authorTip:{
        show:true,
        tip:tip
      }
    })
  }
}