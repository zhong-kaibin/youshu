var config  = require('../config.js')
var pop = require('./prompt.js')
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//获取长url
function getApi(api) {
  return  config.url + api
}

// 是否为空对象
function isEmptyObject(e) {
  var t;
  for (t in e)
    return !1;
  return !0
}


//force强制在code=-99时强制登陆
var time = 3
function getJSON(api, callback, parmas = {}, force) {
  var _api = api
  getApp().getLoginKey(function (key) {
    api.indexOf('?') !== -1 ?
      api += '&platform=applet' :
      api += '?platform=applet';
    api += `&login_key=${key}`
    api += `&s=${getApp().s}`
    api += `&v=${config.version}`
    
    if (parmas.loading) {
      showLoading({
        title: '正在加载',
      })
    }

    if (parmas.collect) {
      api = getColectApi(api)
    } else {
      api = getApi(api)
    }
    console.log(_api, parmas)
    wx.request({
      url: api,
      success: function (res) {
        console.log(res.data)
        if (parmas.noDeal) {
          hideLoading()
          return callback(res.data)
        }

        if (res.data.code == 0) {
          hideLoading()
          callback(res.data)
        }

        else if (res.data.code == -99) {
          time--
          console.log(time, 'forceLogin')
          if (time >= 0) getJSON(_api, callback, parmas, true)
        }
        else {
          pop.toastSad(res.data.msg || '服务器出错了~')
        }
      },
      fail: function (error) {
        hideLoading()
        console.log(error, 'err')
        pop.toastSad('网络出错了~')
        if (parmas.error){
          parmas.error()
        }
      }
    })

  }, force)
}

//有加载提示的获取
function get_wait(api, callback, noDeal) {
  getJSON(api, callback, {
    loading: true,
    noDeal, // 不处理数据直接返回
  })
}

//post请求
var tooo = 3
function post(obj = {}, focre = false) {
  getApp().getLoginKey(function (login_key) {
    var { url, data = {}, success, ...parmas } = obj
    wx.request({
      url: getApi(url) + `?login_key=${login_key}&platform=applet&s=${getApp().s}&v=${config.version}`,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        if (res.data.code === -99) {
          tooo--
          if (tooo >= 0) post(obj, true)
        } else {
          if (success) success(res)
        }
      },
      data: {
        ...data
      },
      ...parmas
    })
  }, focre)
}


//tab和普通导航统一
function navigate(obj) {
  var url = obj.url
  if (url == '/pages/recommend/recommend' || url == '/pages/bookshelf/bookshelf'
    || url == '/pages/classify/classify' || url == '/pages/personal/personal') {
    wx.switchTab(obj)
  } else {
    wx.navigateTo(obj)
  }
}

//格式字数
function formatNum(wordNum) {
  if (wordNum / 10000 >= 1) {
    var num = wordNum / 10000
    if (num >= 100) {
      return num.toFixed(0) + '万字'
    }
    if (num >= 10) {
      return num.toFixed(0) + '万字'
    }
    if (num >= 1) {
      return num.toFixed(1) + '万字'
    }
  }
  if (wordNum / 1000 >= 1) {
    var num = wordNum / 1000
    if (num >= 100) {
      return num.toFixed(0) + '千字'
    }
    if (num >= 10) {
      return num.toFixed(0) + '千字'
    }
    if (num >= 1) {
      return num.toFixed(1) + '千字'
    }
  }
  return wordNum + '字'
}

//首页share
function shareHome() {
  return {
    title: '口袋有书，去哪都有书',
    path: '/pages/recommend/recommend',
    imageUrl: '/image/homeIcon.jpg'
  }
}

//兼容低版本
function showLoading(obj) {
  if (wx.showLoading) {
    wx.showLoading(obj)
  }
  else {
    wx.showToast({
      mask: true,
      duration: 10000,
      icon: "loading",
      ...obj
    })
  }
}

function hideLoading() {
  if (wx.hideLoading) {
    wx.hideLoading()
  }
  else {
    wx.hideToast()
  }
}

//统计api上报
function reportAnalytics(e, obj) {
  for(var key in obj){
    if(obj[key] === undefined) obj[key] = ''
  }
  console.log('report' ,e, obj)
  if (wx.reportAnalytics) {
    wx.reportAnalytics(e, obj)
  }
}

//提示版本低升级
function hintNotExist() {
  wx.showModal({
    title: '版本过低',
    content: '改版本微信不支持此功能，请升级微信版本',
  })
}

function getUserId() {
  return getUserInfo().id 
}

function getUserInfo(){
  return wx.getStorageSync('user_info') || {}
}

function updateUserInfo(){
  getJSON('/user/user_info', function(res){
    wx.setStorageSync('user_info', res.data)
  })
}

module.exports = {
  formatTime: formatTime,
  getApi: getApi,
  get: getJSON,
  getJSON: getJSON,
  get_wait: get_wait,
  navigate: navigate,
  formatNum: formatNum,
  post: post,
  shareHome: shareHome,
  showLoading: showLoading,
  hideLoading: hideLoading,
  isEmptyObject: isEmptyObject,
  hintNotExist: hintNotExist,
  reportAnalytics: reportAnalytics,
  getUserId: getUserId,
  getUserInfo: getUserInfo,
  updateUserInfo: updateUserInfo
}

