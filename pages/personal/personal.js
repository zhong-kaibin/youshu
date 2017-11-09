// personal.js
//获取应用实例
var unit = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    showRecharge: false
  },

  /**
   * 跳转充值
   */
  rechargeTap: function () {
    wx.navigateTo({
      url: '../recharge/recharge'
    })
  },
  /**

  /**
   * 跳转最近阅读
   */
  readedTap: function () {
    wx.navigateTo({
      url: 'page/readed/readed'
    })
  },
  /**
   * 跳转我的书架
   */
  bookshelfTap: function () {
    wx.switchTab({
      url: '../bookshelf/bookshelf'
    })
  },
  /**
   * 跳转充值记录
   */
  rechargeRecordTap: function () {
    wx.navigateTo({
      url: 'page/rechargeRecord/rechargeRecord'
    })
  },
  /**
   * 跳转购买记录
   */
  buyRecordTap: function () {
    wx.navigateTo({
      url: 'page/buyRecord/buyRecord'
    })
  },
  /**
   * 跳转自动购买
   */
  automaticBuyTap: function () {
    wx.navigateTo({
      url: 'page/automaticBuy/automaticBuy'
    })
  },
  aboutUsTap: function(){
    wx.navigateTo({
      url: 'page/about/about',
    })
  },

  settingTap: function(){
    wx.navigateTo({
      url: 'page/setting/setting',
    })
  },
  getJSON: function (cb) {
    var self = this
    unit.get('/user/user_info', res => {
      this.setData({
        userInfo: res.data
      })
      unit.get('/other/config.json',function(res){
        if (res.data.applet_test !=1 ){
          self.setData({
            showRecharge: true
          })
        }else{
          self.setData({
            showRecharge: false
          })
        }
      })
    })
    this.getStorgeSize()
  },

  clearStorge: function () {
    try {
      wx.clearStorageSync()
      wx.showToast({
        title: '清除成功',
      })
      this.getStorgeSize()
    } catch (e) {

    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getJSON()
  },

  getStorgeSize: function () {
    var self = this
    wx.getStorageInfo({
      success: function (res) {
        
        //大于5M自动把章节列表清空
        if(res.currentSize > 5000){
          res.keys.forEach(function(val){
            if (val.indexOf('chapter') !== -1){
              wx.removeStorage({
                key: val
              })
            }
          })
        }

        if (res.currentSize < 2) {
          var size = 0
        } else if (res.currentSize < 1000) {
          var size = res.currentSize + 'KB'
        }
        else {
          var size = res.currentSize / 1000 + 'MB'
        }

        self.setData({
          storgeSize: size
        })
      },
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getJSON(function () {
      wx.stopPullDownRefresh()
    })
  },
  onShow: function(){
    this.getJSON()
  },
  /**
     * 用户点击右上角分享
     */
  onShareAppMessage: function () {
    return unit.shareHome()
  }

})