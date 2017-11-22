// classify.js
var unit = require('../../utils/util.js')
var network = require('../../utils/network.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[{
      key:'1',
      category: '男生',
      subCategory:[{
        img: '',
        classify: '',
        numbers:''
      }]
    }],
    color: {
      1:'blue',
      2:'red',
      3:'orange'
    }
  },
  
  naviToBookList: function(e){
    var {cate_id, title} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/bookList/bookList?cate_id=${cate_id}&title=${title}`,
    })
    
  },
  getJSON: function(cb){
    var list = []
    var that = this
    network.fetch_wait('/category/get_type', {
      needCheckAuthor: true,
      success(data,res){
        for (var key in data.parent_list) {
          var item = {}
          item.key = key
          item.category = data.parent_list[key]
          item.subCategory = data.type_list[key]
          //删除为空的书 固定值
          var delectBoooks = /3026|3016|3001|3028/
          item.subCategory = item.subCategory.filter(val => !val.cate_id.toString().match(delectBoooks))
          list.push(item)
        }
        if (cb) cb()
        that.setData({
          list: list
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getJSON()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getJSON(function () {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return unit.shareHome()
  }
})