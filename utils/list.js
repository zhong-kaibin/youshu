//公用的列表上拉加载功能
// 为空时在data里添加 empty=true  和 complete为 true
// 拉到尽头添加empty=false 和 complete为 为 true
// getFirstPage 清空数据，重新获取第一次
import { get_wait, getApi, showLoading, hideLoading } from './util.js'
class List {

  constructor({ url, page_no = 1, page, attrName, data }) {
    this.page_no = page_no

    this.url = getApi(url)

    this.page = page

    //列表所在对象里的key
    this.attrName = attrName
    this.bodyData = data
  }

  //获取下一页
  getNextPage(cb) {

    if (this.complete) return

    this.page_no++

    this.fetchList(res => {
      var list = this.attrName ? res.data[this.attrName] : res.data

      if (list.length === 0) {
        this.complete = true

        // 设置完成
        this.page.setData({
          empty: false,
          complete: true
        })
      } else {
        this.page.setData({
          list: this.page.data.list.concat(list)
        })
      }

      if (cb) cb()
    })
  }

  //获取首页
  getFirstPage(cb) {

    this.complete = false
    this.page_no = 1

    this.fetchList(res => {
      var list = this.attrName ? res.data[this.attrName] : res.data

      if (list.length === 0) {
        //设置为空
        this.page.setData({
          empty: true,
          complete: true
        })
      } else {
        this.page.setData({
          complete: false,
          list
        })
      }
      if (cb) cb()
    })
  }

  //获取数据
  fetchList(succb) {
    var { url, page_no, attrName, bodyData } = this
    showLoading({
      title: '正在加载中',
    })
    getApp().getLoginKey(function (login_key) {
      wx.request({
        url: url,
        data: {
          ...bodyData,
          page_no: page_no,
          platform: "applet",
          login_key: login_key
        },
        success: function (res) {
          hideLoading()
          if (res.data.code == 0) {
            res = res.data
            succb(res)
          }
          console.log(333, res)
        },
        fail: function (err) {
          hideLoading()
          console.log(err)
        }
      })

    })

    
  }

}

module.exports = {
  List: List
}  