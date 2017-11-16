// pages/reader/reader.js
var unit = require('../../utils/util.js')
var pop = require('../common/pop.js')

var fn = require('../../utils/fn.js')

var { getAllChapter, modifyPayChapter } = require('../../utils/chapter.js')
var { setReadedBook, getBookInfo } = require('../../utils/book.js')
var { recordReading } = require('../../utils/chapter.js')
var { getBalance } = require('../../utils/balance.js')
import { getAutoBuyList } from '../../utils/balance.js'

Page({
  ...pop,
  /**
   * 页面的初始数据
   */
  data: {
    setting: false,
    fast_setting: false,
    title: '',
    content: [],
    index: 0,
    chapterList: [],
    auto_buy: true,
    fromFree: false,
    pay_type: 1,
    index: 0,

    foot: false,
    setting: false,

    lineHeight: 1.5,
    ligthLevel: 50,
    fontSize: 38,
    backColor: '#f5f5f5',
    buyBtnName: '购买',

    bindBannerShow: false
  },

  //下一章
  getNextChapter: function (e) {
    if (this.data.index == this.data.chapterList.length - 1) {
      wx.showToast({
        title: '最后一章了哦~',
      })
      return
    }
    this.setData({
      fromFree: true
    })

    var chapterParam = this.data.chapterList[Number(++this.data.index)]
    this.setData({
      ...chapterParam,
      pay_type: 1,
      content: [' ']
    })
    this.getJSON()
  },

  // 上一章
  getLastChapter: function () {

    if (this.data.index <= 0) {
      wx.showToast({
        title: '已经是第一章了哦~',
      })
      return
    }

    var chapterParam = this.data.chapterList[Number(--this.data.index)]
    this.setData({
      ...chapterParam,
      pay_type: 1,
      content: []
    })
    this.getJSON()
  },

  //目录
  goChapterList: function () {
    var navArr = getCurrentPages()
    var len = navArr.length
    if (len - 2 >= 0 && navArr[len - 2].route === "pages/chapterList/chapterList") {
      wx.navigateBack()
    }
    else {
      var { book_id, book_name } = this.data
      wx.redirectTo({
        url: `/pages/chapterList/chapterList?book_id=${book_id}&total=${this.data.chapterList.length}&book_name=${book_name}`,
      })
    }
  },

  // 书籍详情
  goDetail: function () {
    var navArr = getCurrentPages()
    var len = navArr.length
    if (len - 2 >= 0 && navArr[len - 2].route === "pages/bookDetail/bookDetail") {
      wx.navigateBack()
    }
    else if (len - 3 >= 0 && navArr[len - 3].route === "pages/bookDetail/bookDetail") {
      wx.navigateBack({
        delta: 2
      })
    } else {
      var { book_id } = this.data
      wx.navigateTo({
        url: `/pages/bookDetail/bookDetail?book_id=${book_id}`,
      })
    }
  },

  getJSON: function (cb) {
    unit.showLoading({
      title: '正在加载中~',
    })
    var self = this
    //获取所有章节列表
    var { book_id, index, chapter_id } = this.data
    getAllChapter(this.data.book_id, function (list) {     
      if (!index){
        var chapter_id = self.data.chapter_id
        for (var i = 0; i < list.length; i++) {
          if (list[i].chapter_id == chapter_id){
            index = self.data.index = i;
            break;
          }
        }
      }
     
      var data = list[index]
      var { volume_id, chapter_id, pay_type, cost_money, chapter_name } = data
      console.log(pay_type, index,  'pay_type')
      self.setData({
        book_id,
        cost_money,
        chapter_name,
        chapter_id,
        volume_id,
        chapterList: list,
      })

      //pay_type：1 已经购买，获取内容
      if (pay_type === 1) {
        self.fetchContent()
        
        if(cb)cb()
      } else {
        //判断是否在自动购买列表
        getAutoBuyList(list => {
          var id = Number(book_id)
          var isAuto = list.some(function (item) {
            return item.book_id == id
          })

          //上报购买页面
          unit.reportAnalytics('enter_to_buy_page2', {
            pay_type: 1,
            auto_buy: isAuto.toString(),
            book_name: self.data.book_name,
            chapter_index: self.data.index ,
          });

          self.data.isAuto = isAuto
          //自动购买就购买
          if (isAuto) {
            self.buyChapter()
          }

          //显示购买页面
          else {
            if (cb) cb()

            self.showBuyPage()

            //发送收集信息
            var user_id = unit.getUserId()
            unit.get(`/book/chapter_channel?book_id=${book_id}&user_id=${user_id}&volume_id=${volume_id}&chapters=${chapter_id}&type=read`, function () {})
          }
        })

      }
    })

    //记录阅读到的页数
    recordReading(book_id, index)
    

  },

  fetchContent: function () {
    var self = this
    var { book_id, volume_id, chapter_id } = this.data
    unit.get(`/book/get_content?book_id=${book_id}&volume_id=${volume_id}&chapter_id=${chapter_id}`, function (res) {
      var content = res.data.content.replace(/&quot;|&nbsp;/g, '')
      if (res.data.content.indexOf('<p>') != -1) {
        content = content.replace(/<p>/g, '').split('</p>')
      } else {
        content = content.split('\n')
      }
      
      self.setData({
        content: content,
        pay_type: 1
      })
      unit.hideLoading()
      wx.stopPullDownRefresh()
     
     //发送收集信息
      var user_id = unit.getUserId()
      console.log(user_id, 'user_id')
      unit.get(`/book/chapter_channel?book_id=${book_id}&user_id=${user_id}&volume_id=${volume_id}&chapters=${chapter_id}&type=read`, function () { })

    })
  },

  //展示购买页
  showBuyPage: function () {
    //获取余额
    getBalance(balance => {
      this.setData({
        balance,
        pay_type: 0,
        buyBtnName: balance >= this.data.cost_money ? '购买' : '充值'
      })
      unit.hideLoading()
      wx.stopPullDownRefresh()
    })
  },


  //自动购买按钮
  buyChange: function (e) {
    this.setData({
      auto_buy: !this.data.auto_buy
    })
  },

  //购买章节
  buyChapter: function () {
    var self = this
    var { book_id, volume_id, chapter_id, auto_buy, index } = this.data
    unit.post({
      url: '/buy/chapter/group',
      data: {
        book_id,
        volume_chapter: `${volume_id},${chapter_id}`,
        auto_buy: auto_buy ? 1 : 0
      },
      success: function (res) {
        if (res.data.code == 0) {
          //修改稿购买信息
          modifyPayChapter(book_id, index)
          self.getJSON()
        } 
        //可能没记录购买信息 -5时候直接购买 
        else if (res.data.code == -5) {
          modifyPayChapter(book_id, index)
          self.fetchContent()
        }
        else {
          self.showBuyPage()
          // wx.showToast({
          //   title: '用户余额不足，请充值',
          // })
          self.navigateTodRecharge()         
          // if (this.data.isAuto) {
          // }
        }
      }
    })
  },

  //navi充值页
  navigateTodRecharge: function () {
    var pageLen = getCurrentPages().length || 0
    var {book_id, index} = this.data
    var backurl = encodeURIComponent(`/pages/reader/reader?book_id=${book_id}&index=${index}`)
    wx.redirectTo({
      url: '/pages/recharge/recharge?backurl=' + backurl,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    
    //设置背景颜色
    var backColor = wx.getStorageSync('backColor')
    var { book_id, index, chapter_id } = options
    book_id = Number(book_id)
    var parma = {
      book_id,
      index,
      chapter_id
    }
    if (backColor) parma.backColor = backColor
    this.setData(parma)

    //获取后才记录，防止二次登陆
    this.getJSON(function(){

      //展示 bind pop
      self.showBindPop()

      //记录阅读过书籍
      setReadedBook(book_id, info => {
        self.data.book_name = info.book_name
        console.log(info,'hadReaded')
        wx.setNavigationBarTitle({
          title: info.book_name
        })
        //获取每天奖励
        fn.fetchAwardEveryday()
      })
    })

    // 是否展示底部绑定banner
    var user_info = unit.getUserInfo()
    if (user_info.phone.trim() === ''){
      this.setData({ bindBannerShow: true })
    }

    // 保持屏幕常亮
    if (wx.setKeepScreenOn) {
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
    }

    //设置亮度为机器默认亮度
    if (wx.getScreenBrightness) {
      wx.getScreenBrightness({
        success: function (res){
          self.setData({
            ligthLevel: res.value * 100
          })
        }
      })
    }

  },
  //亮度調節
  ligthChange: function (e) {
    this.setData({
      ligthLevel: e.detail.value
    })
    if (wx.setScreenBrightness) {
      wx.setScreenBrightness({
        value: e.detail.value / 100
      })
    } else {
      unit.hintNotExist()
    }
  },
  
  ligthDefaultChange: function () {
    this.ligthChange({ detail: { value: 50 } })
  },

  //字体调节
  fontSizeChange: function (e) {
    var fontSize = e.detail.value
    this.setData({
      fontSize
    })
  },
  fontSizeDefaultChange: function () {
    this.fontSizeChange({ detail: { value: 38 } })
  },
  //间距调节
  changeLineHeight: function (e) {
    this.setData({
      lineHeight: e.currentTarget.dataset.line
    })
  },
  //背景颜色
  backColorChange: function (e) {
    this.setData({
      backColor: e.currentTarget.dataset.color
    })
    wx.setStorageSync('backColor', e.currentTarget.dataset.color)
  },

  tapShowSetting: function () {
    this.setData({
      foot: !this.data.foot,
      setting: false
    })
  },
  tapShowSubSetting: function () {
    this.setData({
      setting: true
    })
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
    var { book_id, book_name, index, chapter_name } = this.data
    return {
      title: `${book_name} : ${chapter_name}`,
      path: `/pages/reader/reader?book_id=${book_id}&index=${index}&book_name=${book_name}`
    }
  },

  onUnload: function () {
    //关闭常亮
    if (wx.setKeepScreenOn) {
      wx.setKeepScreenOn({
        keepScreenOn: false
      })
    }
  }
})