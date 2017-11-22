var config  = require('../config.js')
var pop = require('./prompt.js')
import netWork from './network.js'
import prompt from './prompt.js'

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

// 是否为空对象
function isEmptyObject(e) {
  var t;
  for (t in e)
    return !1;
  return !0
}

//force强制在code=-99时强制登陆
function getJSON(api, callback, params = {}, force){
  netWork.request({
    url: api,
    success(data,res){
      console.log('%c ' + api,  'color: #bada55', res.data ,'===')
      callback(res.data)
    },
    fail(){
      if (parmas.error) parmas.error()
    },
    forceLogin: force,
    loading: params.loading
  })
}

//有加载提示的获取
function get_wait(api, callback, noDeal) {
  getJSON(api, callback, {
    loading: true,
    noDeal, // 不处理数据直接返回
  })
}

function post(obj = {}, force = false){
  var { url, data = {}, success, ...parmas } = obj
  netWork.request({
    url: url,
    method: "POST",
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    forceLogin: force,
    handleCode:false,
    loading:obj.loading,
    data:data,
    success:function(data,res){
      success(res)
    },
    ...parmas
  })
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

// 获取用户数据相关，必须getLogin后才能调用
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
  getApi: netWork.getUrl,
  get: getJSON,
  getJSON: getJSON,
  get_wait: get_wait,
  navigate: navigate,
  formatNum: formatNum,
  post: post,
  shareHome: shareHome,
  showLoading: prompt.showLoading,
  hideLoading: prompt.hideLoading,
  isEmptyObject: isEmptyObject,
  hintNotExist: hintNotExist,
  reportAnalytics: reportAnalytics,
  getUserId: getUserId,
  getUserInfo: getUserInfo,
  updateUserInfo: updateUserInfo,
}

