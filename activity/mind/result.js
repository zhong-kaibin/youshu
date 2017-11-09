// activity/mind/result.js
import data from './data.js'
import unit from '../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
     sex: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var sex = unit.getUserInfo().sex
    sex = sex == 2? 2 : 1
    var results = sex == 1 ? data.result_man : data.result_women
    var random = Math.floor(Math.random() * 10)
    this.setData({
      result: results[random],
      sex,
      random
    })
  },
  createCard: function(){
    var url = 'https://ssl.kdyoushu.com/applet/mind_test/'
    var {sex, random} = this.data
    if(sex == 1){
      url += 'm' + random + '.png'
    }else{
      url += 'w' + random + '.png'
    }
    wx.previewImage({
      urls: [url]
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