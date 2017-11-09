// readed.js
var unit = require('../../../../utils/util.js')
var { getReadedList } = require('../../../../utils/book.js')
var { recoverReading } = require('../../../../utils/chapter.js')
var { addToShelf } = require('../../../../utils/shelf.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    empty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  getJSON: function(cb){
    var list = getReadedList()
    if(list.length == 0){
      this.setData({
        empty: true
      })
      return
    }
    list.forEach(function (val, index) {
      recoverReading(val.book_id, function (dex) {
        list[index].index = Number(dex) + 1
      })
    })
    this.setData({
      list,
      empty:false
    })
    if(cb)cb()
  },
  naviToRecormend: function(){
    wx.switchTab({
      url: '/pages/recommend/recommend',
    })
  },
  onLoad: function (options) {
    // this.getJSON()
  },
  onShow:function(){
    this.getJSON()
  },
  goto: function () { },
  //加入书架 
  addToShelf: function (e) {
    var { index, book_id } = e.currentTarget.dataset
    addToShelf(book_id, () => {
      this.data.list[Number(index)].is_myself = 1
      this.setData({
        list: this.data.list
      })
      wx.setStorageSync('readedList', this.data.list)
    })
  },

  //导航到阅读页
  goReading: function (e) {
    var { book_id, book_name, is_comic} = e.target.dataset
    recoverReading(book_id, function (index) {
      var url = is_comic == 1 ? '/pages/readerComic/reader' : '/pages/reader/reader'
      wx.navigateTo({
        url: `${url}?book_id=
        ${book_id}&book_name=${book_name}
        &index=${index}`,
      })
    })
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return unit.shareHome()
  }
})