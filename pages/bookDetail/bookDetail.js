// pages/bookDetail/bookDetail.js
var unit = require('../../utils/util.js')
var formId = require('../../utils/util.js')
var pop = require('../common/pop.js')
var { setBookInfo } = require('../../utils/book.js')
var { recoverReading } = require('../../utils/chapter.js')
var { addToShelf } = require('../../utils/shelf.js')


var app = getApp()
Page({
  ...pop,
  ...formId,
  /**
   * 页面的初始数据
   */
  data: {
  },

  //加入书架
  addToShelf: function () {
    if (!this.data.detail)return
    addToShelf(this.data.detail.book_id, () => {
      this.setData({
        is_myself: 1
      })
    })
  },

  //继续阅读
  openReader: function () {
    if (!this.data.detail) return
    var { book_name } = this.data.detail
    var { book_id, index } = this.data
    var url = this.data.detail.is_comic == 1 ? '/pages/readerComic/reader' : '/pages/reader/reader'
    wx.navigateTo({
      url: `${url}?book_id=${book_id}&book_name=${book_name}&index=${index}`,
    })
  },

  //跳转章节列表
  goChapter: function () {
    if (!this.data.detail) return
    var { chapter_num, book_name, is_comic } = this.data.detail
    var { book_id } = this.data
    wx.navigateTo({
      url: `/pages/chapterList/chapterList?book_id=${book_id}&total=${chapter_num}&book_name=${book_name}&is_comic=${is_comic}`   
       })
  },

  getJSON: function (cb) {
    var self = this
    var book_id = this.data.book_id
    unit.get_wait('/book/detail?book_id=' + book_id, function (res) {
      var user_id = unit.getUserId()      
      unit.get(`/book/book_channel?book_id=${book_id}&user_id=${user_id}&type=display`, function () { })      
      var { book_detail, like_book_list, is_myself } = res.data
      setBookInfo(book_detail)
      book_detail.word_count = unit.formatNum(book_detail.word_count)
      book_detail.update_time = book_detail.update_time.split(' ')[0]
      self.setData({
        detail: book_detail,
        like_book_list: like_book_list,
        is_myself: is_myself === undefined ? -1 : is_myself
      })
      if (cb) cb()

    })

    recoverReading(book_id, function (index) {
      self.setData({
        index: index
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    this.setData({
      book_id: options.book_id
    })
    this.getJSON(function(){
      //展示 bind pop
      self.showBindPop()
    })
  },

  goOtherBook: function (e) {
    var pageLen = getCurrentPages().length || 0
    var book_id = e.currentTarget.dataset.book_id
    if (pageLen <= 2) {
      wx.navigateTo({
        url: '/pages/bookDetail/bookDetail?book_id=' + book_id,
      })
    }
    else if (pageLen <= 3) {
      wx.redirectTo({
        url: '/pages/bookDetail/bookDetail?book_id=' + book_id,
      })
    }
    else {
      //关闭所有
      wx.reLaunch({
        url: '/pages/bookDetail/bookDetail?book_id=' + book_id,
      })
    }

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
    return {
      title: this.data.detail.book_name,
      path: `pages/bookDetail/bookDetail?book_id=${this.data.detail.book_id}`
    }
  },
  onHide: function(){
    console.log('onhide')
  }
})