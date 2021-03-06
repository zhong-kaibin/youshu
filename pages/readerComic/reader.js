// pages/reader/reader.js
var unit = require('../../utils/util.js')
var reader = require('./functions .js')
var mix = require('./mix.js')
var pop = require('../common/pop.js')
var fn = require('../../utils/fn.js')
var authorTip = require('../common/authorTip.js')

var { getAllChapter, modifyPayChapter } = require('../../utils/chapter.js')
var { setReadedBook, getBookInfo } = require('../../utils/book.js')
var { recordReading } = require('../../utils/chapter.js')
var { getBalance } = require('../../utils/balance.js')
import { getAutoBuyList } from '../../utils/balance.js'

const App = getApp()
Page({
  ...mix,
  ...pop,
  ...authorTip,
  /**
   * 页面的初始数据
   */
  data: {
    setting: false,
    title: '',
    nextScrollIndex: '0-1',
    scrollIndex: '0-0',
    lastScrollIndex : '0-0',

    chapterList: [],
    auto_buy: true,
    toView: '',
    list: [],
    scrollTops:{},

    buyBtnName: '购买'
  },

  //下一章
  getNextChapter: function (e) {
    var lastChap = this.data.list[this.data.list.length - 1]
    var index = parseInt(lastChap.index)
    if (index >= this.data.chapterList.length - 1) {
      wx.showToast({
        title: '最后一章了哦~',
      })
      return
    }
    
    this.setLoading()
    this.getJSON(++index, data => {
      if (!data) return
      if(e){
        this.setData({
          title: this.data.chapterList[index].chapter_name + ': 1'
        })
        this.updateList(data)
      }else{
        this.updateList(data, 'after')
      }

    })
  },

  // 上一章
  getLastChapter: function (e) {
    var index = parseInt(this.data.list[0].index)
    if (index <= 0) {
      wx.showToast({
        title: '已经是第一章了哦~',
      })
      wx.stopPullDownRefresh()
      return
    }
    this.setLoading()
     
    this.getJSON(--index, data => {
      if(!data)return
      if (e) {
        this.setData({
          title: this.data.chapterList[index].chapter_name + ': 1',
          index: index
        })
        this.updateList(data)
      } else {
        this.updateList(data, 'before')
      }
    })
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
        url: `/pages/chapterList/chapterList?book_id=${book_id}&total=${this.data.chapterList.length}&book_name=${book_name}&is_comic=1`,
      })
    }
  },

  getJSON: function (index, cb) {
    var self = this
    //获取所有章节列表
    var { book_id } = this.data

    getAllChapter(book_id, function (list) {
      self.setData({
        chapterList: list,
      })

      //pay_type：1 已经购买，获取内容
      if (list[index].pay_type === 1) {
        self.fetchContent(index, function(data){
          cb(data)
        })
      }
      else {
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
            chapter_index: self.data.index,
          });

          //自动购买就购买
          if (isAuto) {
            self.buyChapter(index, cb)
          }

          //显示购买页面
          else {
            self.showBuyPage(index, cb)
          }
        })
      }
    })

    //记录阅读到的页数
    recordReading(book_id, index)

  },

  // 更新列表
  updateList: function (data, site) {
    var list = this.data.list
    if (site === 'before') {
      list.unshift(data)
    }
    else if (site === 'after') {
      list.push(data) 
    } else {
      list = [data]
    }

    this.setData({
      list
    })

    this.setComplete()
  },

  //获取内容信息
  fetchContent: function (index, cb) {
    var { book_id, volume_id, chapter_id, pay_type , chapter_name } = this.data.chapterList[index]
    unit.getJSON(`/book/get_content?book_id=${book_id}&volume_id=${volume_id}&chapter_id=${chapter_id}`,
      function (res) {
        cb({
          content: res.data.content,
          index,
          pay_type: 1,
          chapter_name,
          scrollTop:0
        })
      })
  },

  //展示购买页
  showBuyPage: function (index , cb) {
    //获取余额
    getBalance(balance => {
      this.setData({
        balance
      })
      var { cost_money, chapter_name } = this.data.chapterList[index]

      this.setData({
        cost_money,
        title: chapter_name,
        index: index,
        buyBtnName: balance >= cost_money ? '购买' : '充值'
      })
      var obj = {
        pay_type: 0,
        content: [],
        index: index
      }
      if (cb) return cb(obj)
      this.updateList(obj, 'after')  
    })
  },


  //自动购买按钮
  buyChange: function (e) {
    this.setData({
      auto_buy: !this.data.auto_buy
    })
  },

//手动购买
  tapBuyChapter: function(e){
    this.buyChapter(e.currentTarget.dataset.index,  data =>{
      if(!data) return
      this.data.list.pop()
      this.updateList(data, 'after')
    })
  },  

  //购买章节
  buyChapter: function (index, cb) {
    var self = this
    var { auto_buy} = this.data
    var { book_id, volume_id, chapter_id } = this.data.chapterList[index]
    console.log(book_id, volume_id, chapter_id, auto_buy);
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
          self.getJSON(index, cb)
        }
        //可能没记录购买信息 -5时候直接购买 
        else if (res.data.code == -5) {
          modifyPayChapter(book_id, index)
          self.fetchContent(index, cb)
        }
        else {
          // if(cb)cb(false)
          self.showBuyPage(index, cb)
          self.navigateTodRecharge()   
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    App.query = options
    this.setData(options)
    this.setLoading()
    this.getJSON(options.index, data => {
      //展示 bind pop
      this.showBindPop()

      this.setData({
        title: this.data.chapterList[options.index].chapter_name + ': 1'
      })
      this.updateList(data)
      //记录阅读过书籍
      setReadedBook(options.book_id, info => {
        this.data.book_name = info.book_name
        wx.setNavigationBarTitle({
          title: info.book_name
        })

        //获取每天奖励
        fn.fetchAwardEveryday()
        
      })
    })

    //获取每天奖励
    fn.fetchAwardEveryday()
  },

  tapShowSetting: function () {
    if (this.data.pay_type == 0) return
    this.setData({
      setting: !this.data.setting,
    })
  },

  drawBottom: function (e) {
    if (this.data.loading) return
    if (this.data.list[this.data.list.length - 1].pay_type == 0)return
    this.inBottom = true
    this.getNextChapter()
  },

  //图片加载
  imgLoad:function(e){
    var { index, idx } = e.currentTarget.dataset
    this.data.scrollTops[index + '-' + idx] = e.target.offsetTop
    var list = this.data.list
    if (!list[index].completeContent) list[index].completeContent = [];
      (this.data.list[index].completeContent)[idx] = (this.data.list[index].content)[idx]
      
    this.setData({
      list: this.data.list
    })
  },

// 滑动设置标题
  scroll: function(e){
    if (e.detail.scrollTop > this.data.scrollTops[this.data.nextScrollIndex]){
      var [parentIndex, index] = this.data.nextScrollIndex.split('-')      
      parentIndex = parseInt(parentIndex)
      index = parseInt(index)
      var { nextScrollIndex, scrollIndex, lastScrollIndex, list, scrollTops } = this.data

      this.data.lastScrollIndex = scrollIndex
      this.data.nextScrollIndex = scrollTops[parentIndex + '-' + (parseInt(index) + 1)] && parentIndex + '-' + (parseInt(index) +1 )||
        scrollTops[parseInt(parentIndex) + 1 + '-0'] && parseInt(parentIndex) + 1 + '-0'  || nextScrollIndex
      this.data.scrollIndex = this.data.nextScrollIndex

       this.setData({
         title: `${(list[parentIndex].chapter_name)}: ${1 + index}`,
         index: list[parentIndex].index
       })
       
    } else if (e.detail.scrollTop < this.data.scrollTops[this.data.lastScrollIndex]){
      var [parentIndex, index] = this.data.nextScrollIndex.split('-')
      parentIndex = parseInt(parentIndex)
      index = parseInt(index)
      var { nextScrollIndex, scrollIndex, lastScrollIndex, list, scrollTops } = this.data

      var possibleIndex1 = parentIndex + '-' + (index - 1)
      var possibleIndex2 = parentIndex - 1 >= 0 ? (parentIndex - 1) + '-' + (list[parentIndex -1].content.length -1) : '0-0'

      this.data.lastScrollIndex = scrollTops[possibleIndex1] && possibleIndex1 ||
        scrollTops[possibleIndex2] && possibleIndex2 || nextScrollIndex

      this.data.nextScrollIndex = scrollIndex
      this.data.scrollIndex = lastScrollIndex

      this.setData({
        title: `${list[parentIndex].chapter_name}: ${1 + index}`,
        index: list[parentIndex].index
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var { book_id, book_name, index, title } = this.data
    return {
      title: `${book_name} : ${title}`,
      path: `/pages/readerComic/reader?book_id=${book_id}&index=${index}&book_name=${book_name}`
    }
  },

})