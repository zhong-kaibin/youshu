import network from './network.js'
var appConfig;
const config = {
  //获取应用程序配置信息
  fetchConfig: function (cb = () => { }) {
    if (appConfig) {
      cb(appConfig)
    } else {
      network.request({
        needLogin: false,
        needCheckAuthor:true,
        url: '/other/config.json',
        success: function (data) {
          appConfig = data
          cb(data)
        }
      })
    }
  }
}

module.exports = config