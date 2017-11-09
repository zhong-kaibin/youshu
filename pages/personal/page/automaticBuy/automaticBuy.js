// automaticBuy.js
import unit from '../../../../utils/util.js'
import { getAutoBuyList } from '../../../../utils/balance.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resource: [
    ]   
  },
  
  /**
   * 开关操作
   */
  switchChange: function (e) {
    unit.showLoading({
      title: '设置中',
    })
    unit.post({
      url: '/buy/next/auto',
      data: {
        book_id: e.currentTarget.dataset.book_id,
        auto_buy: e.detail.value ? 1 : 0
      },
      success: res =>{
        if(res.data.code === 0){
          wx.showToast({
            title: '设置成功',
          })
        }else{
          wx.showToast({
            title: '设置失败',
          })
        }
      }
      
    })
  },


  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    unit.get_wait('/buy/next/auto/list', res => { 
        this.setData({
          resource: res.data
        })
    })
  },
  
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return unit.shareHome()
  }
})