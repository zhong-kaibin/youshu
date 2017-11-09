// rechargeRecord.js
import unit from '../../../../utils/util.js'
import {List} from '../../../../utils/list.js' 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [
    ],
    empty: false

  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.list = new List({
      page: this,
      url: `/recharge/log`,
      attrName: ''
    })
    this.list.getFirstPage()
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.list.getFirstPage(function(){
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.list.getNextPage()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return unit.shareHome()
  }
})