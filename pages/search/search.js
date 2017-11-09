// pages/search/search.js
var unit = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search_book: '',
    keyWords: [],
    result:[]      
  },
  changeBook: function(e){
    var val = e.detail.value
    if (val === this.data.search_book) return
    this.setData({
      search_book: val
    })
    if(val.trim() === ''){
      this.setData({
        result: []
      })
    }
  },

  searchBook: function(){
    if (this.data.search_book.trim() === ''){
      return wx.showToast({
        title: '请输入书名',
      })
    }
    this.data.keyWords.push(this.data.search_book)
    this.setData({
      keyWords: this.data.keyWords
    })
    wx.setStorage({
      key: 'searchRecord',
      data: this.data.keyWords,
    })  
    this.getBookList(this.data.search_book)
  },

  searchHistory:function(e){
      var key = e.currentTarget.dataset.key
      this.setData({
        search_book: key
      })
      this.getBookList(key)
  },

  getBookList: function(key){
    var self =this
    unit.get_wait(`/book/find_book?params=${key}&num=10000` , function (res) {
       var list = res.data.book_list
       self.setData({
         result: list
       })
       if (list.length === 0){
         wx.showToast({
           title: '没相关记录哦~~',
         })
       }
    })
  },

  deleteAllKey: function(){
    this.setData({
      keyWords:[]
    })
    wx.setStorage({
      key: 'searchRecord',
      data: this.data.keyWords,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var keyWords = wx.getStorageSync('searchRecord') || []
    this.setData({
      keyWords: keyWords
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})