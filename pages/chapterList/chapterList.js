// pages/chapterList/chapterList.js
var unit = require('../../utils/util.js')
var { getAllChapter , recoverReading } = require('../../utils/chapter.js')


Page({
  /**
   * 页面的初始数据
   */
  data: {
    total: 0,
    page:1,
    book_id: null,
    book_name:'', 
    list:[],
    complete:false,
    len: 0 ,
    page_no:1,
    page_len: 50, //每页条数
    desc: false, //是否倒叙
  },

  //导航到阅读页
  goDetail: function(e){
    var index = e.currentTarget.dataset.index
    var data = this.list[index]
    

    if (this.data.desc) {
      index = this.data.len - index -1 
    }
    var url = this.data.is_comic != 1 ? '/pages/reader/reader' : '/pages/readerComic/reader'

    wx.navigateTo({
      url: url  +  `?book_id=${this.data.book_id}&index=${index}`,

    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var { book_id, total, book_name, is_comic} = options
    this.setData({
      book_id,
      total,
      book_name,
      is_comic
    })
    // 设定加载所有目录
    unit.showLoading({
      title: '正在加载',
    })
    getAllChapter(book_id,  list =>{
      this.list = list.slice(0)
      this.data.len = list.length
      this.getFirstPage()
    })
    unit.hideLoading()
  },
  
  getFirstPage: function(){
    var { page_no, page_len } = this.data
     this.setData({
       list: this.list.slice(0, page_no * page_len)
     })
  },
  
  getNextPage: function(){
    var { page_no, page_len } = this.data
    this.setData({
      page_no:  ++page_no,
      list: this.list.slice(0, page_no * page_len)
    })
  },

  //倒叙排列
  sortDesc: function(){
    if (!this.list)return
    this.list.reverse()
    this.setData({
      desc: !this.data.desc,
      list:[]
    })
    this.getFirstPage()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var { page_no, page_len ,len } = this.data
    if (page_no * page_len <= len){
      this.getNextPage()
    }
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
    return {
      title: this.data.book_name,
      path: `/pages/bookDetail/bookDetail?book_id=${this.data.book_id}`
    }
  }
})