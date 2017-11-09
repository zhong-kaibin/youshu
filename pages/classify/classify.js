// classify.js
var unit = require('../../utils/util.js')
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
  getJSON: function(){
    var list = []
    var that = this
    unit.get_wait('/category/get_type', function (data) {
      console.log(data)
      var data = data.data
      for(var key in data.parent_list){
        var item = {}
        item.key = key
        item.category = data.parent_list[key]
        item.subCategory = data.type_list[key]
        list.push(item)
      }
      that.setData({
        list: list
      })
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
    this.getJSON()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return unit.shareHome()
  }
})