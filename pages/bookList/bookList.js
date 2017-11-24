// bookList.js
var unit = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    complete: false,
    list: [],
  },

  getJSON: function (cb) {
    var { url} = this.data
    var self = this
    unit.get_wait(url + '&page_no=' + this.data.page++, function (res) {
      var list = res.data.book_list
        if (list.length === 0) {
          self.setData({
            complete: true
          })
        }
        self.setData({
          list: self.data.list.concat(list)
        })

        if(cb)cb()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var { sex = '', params, title, cate_id } = options

    if(title){
      wx.setNavigationBarTitle({
        title: title
      })
    }

    if (params) {
      var url = `/book/find_more?sex=${sex}&params=${params}`
    } else if (cate_id){
      var url = `/category/get_book?cate_id=${cate_id}`
    }
    this.setData({
      url: url
    })

    this.getJSON()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getJSON(function(){
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (e) {
    if (this.data.complete)return
    this.getJSON()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return unit.shareHome()
  }
})