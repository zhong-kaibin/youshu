import config from '../config.js'
import pop from './prompt.js'


var time = 3
//如getSetting方法不存在, isAuthor为true, APP全接口强制getLoginKey
var isAuthor;
function checkAuthor(){
  return new Promise((resolve, reject) =>{
    if (isAuthor !== undefined){
      resolve(isAuthor)
    }else{
      if (wx.getSetting) {
        // wx.getUserInfo()
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.userInfo']) {
              resolve(false)
            } else {
              resolve(true)
            }
          }
        })
      } else {
        resolve(true)
      } 
    }  
  })
}


const netWork = {
  request(params) {
    const App = getApp() 
    let { url,
      success,
      handleCode = true,
      needLogin = true, //默认需要登陆
      forceLogin = false,//默认不强制登陆
      needCheckAuthor = false,//****默认不检测授权,  如果检测到已经授权，都附带登陆信息； 没有授权就根据needLogin 确定是否需要登陆（登陆前要获得搜权*****）
      fail, handleFail = false, 
      error, handleError = true,
      loading = false, ...argus } = params
    url = netWork.getUrl(url)
    new Promise((resolve, reject) => {
      if (needCheckAuthor){
        checkAuthor()
        .then(isAuthor =>{
          if (isAuthor){
            App.getLoginKey(login_key => {
              resolve(login_key)
            }, forceLogin)
          }else{
            resolve(null)
          }
        })
      }else{
        if (needLogin) {
          App.getLoginKey(login_key => {
            resolve(login_key)
          }, forceLogin)
        } else {
          resolve(null)
        }
      }
      
    }).then(login_key => {
      // console.error(needLogin,login_key)
      let baseQuery = {
        platform: "applet",
        s: App.s,
        v: config.version,
      }
      if (login_key) baseQuery.login_key = login_key
      url.indexOf('?') === -1 ?
        url += '?' :
        url += '&'
      url += netWork.serializeUrlParams(baseQuery)

      if (loading) pop.showLoading({
        title: '正在加载'
      })

      wx.request({
        url,
        ...argus,
        success(res) {
          if (loading) pop.hideLoading()
          if (res.data.code == 0) {
            if (success) success(res.data.data, res)
          } else if (res.data.code == -99) {
            time--
            if (time >= 0) netWork.request({...params, forceLogin: true})
          } else if (success) {
            success(null, res)
            if (handleCode) pop.toastSad(res.data.msg || '服务器出错了~')
          }
        },
        fail(err) {
          if (loading) pop.hideLoading()
          if (error) error()
          if (handleError) pop.toastSad('网络出错了~')
        }
      })
    })
  },
  fetch(url, params) {
    netWork.request({
      url,
      ...params,
      method: 'GET'
    })
  },
  fetch_wait(url, params){
    netWork.request({
      url,
      loading: true,
      ...params,
    })
  },
  post() {

  },

  //获取长url
  getUrl(url) {
    return url.slice(0, 1) === '/' ?
      config.url + url :
      url
  },
  //序列化url请求参数 没encode参数
  serializeUrlParams(obj) {
    var str = ''
    for (var key in obj) {
      str += `${key}=${obj[key]}&`
    }
    return str.slice(0, -1)
  }
}
netWork.checkAuthor = checkAuthor
module.exports = netWork

