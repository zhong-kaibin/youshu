// home.js
var unit = require('../../utils/util.js')
var pop = require('../common/pop.js')
var prompt = require('../../utils/prompt.js')
var network = require('../../utils/network.js')
var { fetchConfig } = require('../../utils/appConfig.js')
var app = getApp()
Page({
  ...pop,
  timestamp: null,
  onLoad: function (options) {
  },
  onShow: function () {
    fetchConfig(config => {   //获取 channel-list
        console.log('recommend-15',config);
      if (this.timestamp != config.timestamp) {
        this.timestamp = config.timestamp
        this.setData({
          channel_types: config.channel_types,
          channel_code: config.channel_types[0].channel_code
        })
        //展示 bind pop bug: 因为要判断登陆信息存在是否绑定，所以在一个接口请求完再调用
        this.showBindPop() 
        this.getJSON()
      }
    }, true)
  },
  getJSON: function (cb) {
    var that = this
    network.fetch('/book/v2/index', {
      needCheckAuthor: true,
      loading: true,
      data: {
        channel_code: this.data.channel_code
      },
      success: function (data) {
        if (cb) cb()
        var banners = data.banner_list.filter(function (val) {
          return val
        })
        //穿越测试活动
        // banners.unshift({
        //   wxurl: '/activity/mind/mind',
        //   banner_url:'https://ssl.kdyoushu.com/applet/mind_test/at_test_banner.png'
        // })
        that.setData({
          banner_list: banners,
          top_list: data.top_list,
          book_shelf_data: data.book_shelf_data,
          current: 0
        })
      }
    })
  },

  data: {
    logo: '../../image/hd-logo.png',
    searchImg: '../../image/search.png',
    sex: 1,
    banner_list: [],
    top_list: [],
    current: 0,//修复切换banner的bug
    book_shelf_data: [],
    channel_types: []
  },
  // selected: function (e) {
  //   this.setData({
  //     sex: 1
  //   })
  //   this.getJSON()
  // },
  // selected1: function (e) {
  //   this.setData({
  //     sex:2
  //   })
  //   this.getJSON()
  // },
  tapChannel: function (e) {
      console.log('79', e);
      
    var { channel_code } = e.currentTarget.dataset
    console.log('82', channel_code);
    
    this.setData({
      channel_code
    })
    this.getJSON()
  },
  /**
   * 跳转搜索页
   */
  search: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },

  tapBanner: function (e) {
    var { index, wxurl, applet_activity } = e.currentTarget.dataset
    var book_id = this.data.banner_list[index].params.book_id
    if (wxurl) {
      unit.navigate({
        url: wxurl,
      })
    } else if (applet_activity) {
      unit.navigate({
        url: applet_activity
      })
    } else if (book_id) {
      wx.navigateTo({
        url: '/pages/bookDetail/bookDetail?book_id=' + this.data.banner_list[index].params.book_id,
      })
    }
  },

  //topList导航
  naviTopList: function (e) {
    var { url, applet_activity, title } = e.currentTarget.dataset
    if (applet_activity) {
      unit.navigate({
        url: applet_activity
      })
    } else if (url) {
      wx.navigateTo({
        url: `/pages/website/website?url=${url}&title=${title}`,
      })
    }
  },

  /**
   * 跳转列表
   */
  goList: function (e) {
    var { params, title, applet_activity } = e.target.dataset
    if (applet_activity) {
      unit.navigate({
        url: applet_activity.trim()
      })
    } else {
      wx.navigateTo({
        url: `/pages/bookList/bookList?params=${params}&sex=${this.data.sex}&title=${title}`
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
    return unit.shareHome()
  }
})