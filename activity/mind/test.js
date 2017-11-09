// activity/mind/test.js
import data from './data.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ...data,
    checks:[],
    index:0,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  select: function(e){
    if(this.data.ifselect) return
    this.data.ifselect = true
    
    var inx = e.currentTarget.dataset.index
    this.data.checks.push(inx)
    this.setData({
      check: inx
    })
    if (this.data.index == 9) {
      return wx.redirectTo({
        url: './result',
      })
    }
    setTimeout(()=>{
      this.setData({
        index: ++this.data.index,
        checks: this.data.checks,
        check:-1,
        ifselect: false
      })
    }, 100)
  },


})