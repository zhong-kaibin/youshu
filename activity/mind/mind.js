// activity/mind/mind.js
import unit from '../../utils/util.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  getJSON: function(){
    getApp().getLoginKey(function () {
      unit.hideLoading()
    })
  },
  onLoad: function (options) {
    this.getJSON()
  },
  naviToTest: function(){
    wx.redirectTo({
      url: './test',
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '测测穿越后你最像哪个小说的主角',
      path: 'activity/mind/mind?s=l6k4',
    }
  }
})