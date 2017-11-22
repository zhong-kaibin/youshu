// bookshelf.js
var unit = require('../../utils/util.js')
var formId = require('../../utils/formId.js')
var { recoverReading} = require('../../utils/chapter.js')
var { getMyShelf, upDateShelf } = require('../../utils/shelf.js')

Page({
  ...formId,
  /**
   * 页面的初始数据
   */
  data: {
    manage: false,
    checkedBooks:[],
    list:[] ,
    checkName: "全选"
  },

  //导航到阅读页
  goReading: function(e){
    var { book_id, book_name, is_comic} = e.target.dataset
    var url = is_comic == 1 ? '/pages/readerComic/reader' : '/pages/reader/reader'
    recoverReading(book_id, function(index){
      wx.navigateTo({
        url: `${url}?book_id=
        ${book_id}&book_name=${book_name}
        &index=${index}`,
      })
    })
  },

//catchtap 阻止冒泡
  todo:function(){},


// 导航到章节列表
  goChapter: function(e){
    var { book_id, chapter_num, book_name ,is_comic} = e.target.dataset
    wx.navigateTo({
      url: '/pages/chapterList/chapterList?book_id=' + book_id + '&total=' + chapter_num + '&book_name=' + book_name + '&is_comic=' + is_comic,
    })
  },
  
  //判断全选反选按钮名字
  checkName: function(){
    var name;
    this.data.list.length === this.data.checkedBooks.length ?
        name = "反选" :
        name = "全选" ;
    this.setData({
      checkName: name
    })    

  },

  // 勾选
  check: function (event) {
    this.setData({
      checkedBooks: event.detail.value
    })
    this.checkName()
  },

  //全选
  checkAll: function(){
    var checks = []
    var bool = this.data.list.length !== this.data.checkedBooks.length
    var list = this.data.list.map(function(val,index){
      if (bool)checks.push(val.book_id)
      val.checked = bool
      return val
    })
    this.setData({
      checkedBooks: checks,
      list: list
    })
    this.checkName()
  },

  //删除
  deleteSelect: function(){
    var self= this
    var book_ids = this.data.checkedBooks.join('|')

    unit.showLoading({
      title: '删除中',
    })
    unit.get('/book/del_bookcase?book_ids=' + book_ids, function(){
      upDateShelf(function(list){
        self.setData({
          list: list
        })
        unit.hideLoading()
      })
      
      //记录修改后的历史
      var readedList = wx.getStorageSync('readedList') || []
      self.data.checkedBooks.forEach(function(val){
        readedList.forEach(function(v,index){
          if (val == v.book_id){
            readedList[index].is_myself =0
          }
        })
      })
      wx.setStorageSync('readedList', readedList)
    })
  },

  getJSON: function (cb, refresh) {
    var list = []
    var that = this
    if (!refresh){
      unit.showLoading({
        title: '正在加载中',
      })
    }

    upDateShelf(function(list){
      if (!refresh) unit.hideLoading()
    
      that.setData({
        list: list
      })

      if (cb) cb()
    })

  },

  // 书籍管理按钮
  bookEdit: function () {
    this.checkName()
    this.setData({
      manage: (!this.data.manage)
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
  
  onShow:function(){
    this.getJSON(()=>{
      this.setData({
        manage: false,
      })
    }, true)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return unit.shareHome()
  }
})