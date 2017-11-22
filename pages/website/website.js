// pages/website/website.js
Page({
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      url: options.url
    })
    wx.setNavigationBarTitle({
      title: options.title || ''
    })
  },

})