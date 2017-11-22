//app.js
const unit = require('./utils/util.js')
const config = require('/config.js')
const { recordPayChapter } = require('./utils/chapter.js')
import { fetchConfig} from './utils/appConfig.js'

App({
  onLaunch: function (options) {
    console.log(options, 'optionsoptions')
    const query = this.query = options.query
    this.s = query.s || 'gza5'
    this.path = options.path
    //从模板里进来   ****recommend_from_template  推荐页  reader_from_template  阅读器****** D
    if (query.collection) {
      unit.reportAnalytics(query.collection, {})
    }
    // 上报打开小程序
    unit.reportAnalytics('enter_applet', {
      channel: this.s,
      path: options.path,
      book_id: query.book_id,
      collection: query.collection
    });
  },

  onHide: function () {
    recordPayChapter()
  },

  //流程控制:并行请求
  requestOpen: false,
  requestQueue: [],
  //force 强制登陆
  getLoginKey: function (cb, force = false) {
    if (force) {
      this.login(cb)

    } else if (this.login_key) {
      cb(this.login_key)

    } else {
      this.requestQueue.push(cb)
      var self = this
      if (!this.requestOpen) {
        wx.checkSession({
          success() {
            var key = wx.getStorageSync('login_key')
            if (key) {
              self.login_key = key
              cb(key)

            } else {
              self.login(cb)
            }
          },
          fail() {
            self.login(cb)
          }
        })
      }
    }
  },

  login: function (cb) {
    var self = this
    this.requestOpen = true
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log('loginSuccess', res.code)
          self.getAllUserInfo(function (user) {
            wx.request({
              url: unit.getApi(`/user/oauth_login?platform=applet&s=${self.s}&v=${config.version}`),
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              dataType: 'json',
              data: {
                ...user,
                code: res.code
              },
              success: function (res) {
                if (res.data.code == 0) {
                  res = res.data.data
                  console.log(res, 'getOAuthSuccess')
                  self.user_info = res.user_info
                  self.login_key = res.login_key
                  wx.setStorageSync('login_key', res.login_key)
                  wx.setStorageSync('user_info', res.user_info)

                  self.requestOpen = false
                  self.requestQueue.forEach(cb => cb(res.login_key))
                  self.requestQueue = []

                  if (res.is_register == 1) {
                    unit.reportAnalytics('new_user_login', {
                      path: self.path,
                      channel: self.s
                    })
                  }
                } else {
                  wx.showToast({
                    title: res.data.msg || '',
                  })
                }
              },
              fail: function (err) {
                console.log('oauth_login', err)
                cb(null)
              }
            })
          })

        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });



  },

  //获取用户全部信息包括加密信息
  getAllUserInfo: function (callback) {
    var self = this
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        if (res.userInfo.gender == 0) res.userInfo.gender = 1
        callback(res)
      },
      fail: function () {
        self.showAutoModel()
      }
    })
  },

  //提示授权
  showAutoModel: function () {
    var self = this
    unit.hideLoading()
    wx.showModal({
      title: '用户未授权',
      content: '如需正常使用口袋阅读王，请按确定并在授权管理中选中“用户信息”，仅是获取用户公开的信息。',
      showCancel: true,
      success: function (res) {
        //修复流程控制bug
        self.requestOpen = false,
        self.requestQueue = []
        if (res.confirm) {
          wx.openSetting({
            success: function success(res) {
              //授权成功手动调用当前页onload
              var pages = getCurrentPages()
              pages[pages.length -1].onLoad(self.query)
            }
          });
        } else {
          wx.switchTab({
            url: '/pages/recommend/recommend',
          })
        }
      }
    })
  },
})
