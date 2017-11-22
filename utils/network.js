import config from '../config.js'
import pop from './prompt.js'

var time = 3
const netWork = {
  request(params) {
    const App = getApp()

    let { url, success, handleCode = true,
      needLogin = true, forceLogin = false,
      fail, handleFail = false, error, handleError = true,
      loading = false, ...argus } = params
    url = netWork.getUrl(url)

    new Promise((resolve, reject) => {
      if (needLogin) {
        App.getLoginKey(login_key => {
          resolve(login_key)
        }, forceLogin)
      } else {
        resolve(null)
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

      if (loading) pop.showLoading()

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
module.exports = netWork

