// home.js
var unit = require('../../utils/util.js')
var pop = require('../common/pop.js')

var app = getApp()
Page({
  ...pop,
  /**
   * 页面的初始数据
   */
  data: {
    logo: '../../image/hd-logo.png',
    searchImg: '../../image/search.png', 
    sex: 1,
    banner_list: [],    
    top_list:[],
    comic_data:[]
  },
  selected: function (e) {
    this.setData({
      sex: 1
    })
    this.getJSON()
  },
  selected1: function (e) {
    this.setData({
      sex:2
    })
    this.getJSON()
  },
  tapJumpAppPop: function(){
    unit.reportAnalytics('text_dota', {});
    wx.showModal({
      title: '更多书籍',
      content: '请前往各大应用市场搜索下载“口袋有书”',
      showCancel: false
    })
  },
  /**
   * 跳转搜索页
   */
  search: function() {
    wx.navigateTo({
      url: '../search/search'
    })
  },

  tapBanner: function(e){
    var { index, wxurl} = e.currentTarget.dataset
    if (wxurl){
      return wx.navigateTo({
        url: wxurl,
      })
    }
    var book_id = this.data.banner_list[index].params.book_id
    if (!book_id)return
    wx.navigateTo({
      url: '/pages/bookDetail/bookDetail?book_id=' + this.data.banner_list[index].params.book_id,
    })
  },

  /**
   * 跳转列表
   */
  goList: function (e) {
    var {params,title} = e.target.dataset
    wx.navigateTo({
      url: `/pages/bookList/bookList?params=${params}&sex=${this.data.sex}&title=${title}`
    })
  },

  //get JSON
  getJSON: function(){
    var that = this
    unit.get_wait('/book/index?sex=' + this.data.sex, function (res) {
      //打开模板调试
      // unit.get('/user/get_message', function () { })
      var data = res.data
      var banners = data.banner_list.filter(function (val) {
        return val
      })
      banners.unshift({
        wxurl: '/activity/mind/mind',
        banner_url:'https://ssl.kdyoushu.com/applet/mind_test/at_test_banner.png'
      })
      that.setData({
        banner_list: banners,
        hot_data: data.hot_data,
        top_list: data.top_list,
        new_data: data.new_data,
        finish_data: data.finish_data,
        comic_data: data.comic_data
      })
    })
  },

  //顶部导航
  navigate_top: function(e){
    var url = e.target.dataset.url
    unit.navigate({
      url: url
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var code = wx.getStorageSync('code')
    unit.showLoading({
      title: '正在加载',
    })

    getApp().getLoginKey(()=>{
      //展示 bind pop bug: 因为要判断登陆信息存在是否绑定，所以再一个接口请求完再调用
      this.setData({
        sex: unit.getUserInfo().sex || 1
      })
      this.showBindPop()
      this.getJSON()
    })
    // unit.get('/user/user_info', res => {
      
    // })
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