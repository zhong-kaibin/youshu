import network from './network.js'

const fetchConfig = {
  //获取应用程序配置信息
  fetchConfig: function(cb){
    network.request({
      needLogin:false,
      url: '/other/config.json',
      success:function(res){
        console.log(res,'111111111')
      }
    })
  }
}

module.exports = fetchConfig