// pages/rank.js
var unit = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  /**
     * 返回上一页
     */
  backTap: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  getJSON: function(){
    var {url, sex, parmas} = this.data
    unit.get_wait(url, function(res){

    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var url = ''
    var {sex, params} = options
    if (params.search(/hot|new|finish/) != -1){
      var url = `/book/find_more?sex=${sex}&params=${params}`
    }
    this.setData({
      url: url
    })
    this.getJSON()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})